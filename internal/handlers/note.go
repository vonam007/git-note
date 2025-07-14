package handlers

import (
	"net/http"
	"strconv"

	"github-notes-backend/internal/database"
	"github-notes-backend/internal/middleware"
	"github-notes-backend/internal/models"
	"github-notes-backend/internal/services"
	"github-notes-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type NoteHandler struct {
	githubService *services.GitHubService
}

func NewNoteHandler() *NoteHandler {
	return &NoteHandler{
		githubService: services.NewGitHubService(),
	}
}

func (h *NoteHandler) CreateNote(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var req models.CreateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Get user to access GitHub token
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found")
		return
	}

	note := models.Note{
		ID:             uuid.New(),
		UserID:         userID,
		Title:          req.Title,
		Content:        req.Content,
		GithubPRNumber: req.GithubPRNumber,
		RepoOwner:      req.RepoOwner,
		RepoName:       req.RepoName,
	}

	// If GitHub PR info is provided, fetch and store PR data
	if req.GithubPRNumber != nil && req.RepoOwner != "" && req.RepoName != "" {
		if user.GithubToken == "" {
			utils.ErrorResponse(c, http.StatusBadRequest, "GitHub token is required to fetch PR information. Please update your profile first.")
			return
		}

		// Validate GitHub PR parameters
		if *req.GithubPRNumber <= 0 {
			utils.ErrorResponse(c, http.StatusBadRequest, "PR number must be greater than 0")
			return
		}

		// Check if PR already exists in database
		var existingPR models.PullRequest
		err := database.DB.Where("number = ? AND repo_owner = ? AND repo_name = ?",
			*req.GithubPRNumber, req.RepoOwner, req.RepoName).First(&existingPR).Error

		if err != nil {
			// PR doesn't exist, fetch from GitHub
			prData, err := h.githubService.GetPullRequest(req.RepoOwner, req.RepoName, *req.GithubPRNumber, user.GithubToken)
			if err != nil {
				utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
				return
			}

			// Create new PR record
			newPR := models.PullRequest{
				ID:        uuid.New(),
				Number:    prData.Number,
				RepoOwner: req.RepoOwner,
				RepoName:  req.RepoName,
				Title:     prData.Title,
				Body:      prData.Body,
				Author:    prData.User.Login,
				State:     prData.State,
				URL:       prData.HTMLURL,
			}

			if err := database.DB.Create(&newPR).Error; err != nil {
				utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to save PR information")
				return
			}

			existingPR = newPR
		}

		// Create note first
		if err := database.DB.Create(&note).Error; err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create note")
			return
		}

		// Create note-PR link
		if err := database.DB.Model(&note).Association("PullRequests").Append(&existingPR); err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to link note with PR")
			return
		}
	} else {
		// Create note without PR information
		if err := database.DB.Create(&note).Error; err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create note")
			return
		}
	}

	// Fetch the created note with associations
	if err := database.DB.Preload("PullRequests").First(&note, note.ID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch created note")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, note)
}

func (h *NoteHandler) GetNotes(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	page, limit, offset := utils.GetPaginationParams(c)

	// Get search parameters
	search := c.Query("search")
	prNumber := c.Query("pr_number")
	prState := c.Query("pr_state")

	query := database.DB.Where("user_id = ?", userID)

	// Apply filters
	if search != "" {
		query = query.Where("title ILIKE ? OR content ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if prNumber != "" {
		if num, err := strconv.Atoi(prNumber); err == nil {
			query = query.Where("github_pr_number = ?", num)
		}
	}

	if prState != "" {
		// Join with pull_requests table to filter by PR state
		query = query.Joins("JOIN note_pr_links ON notes.id = note_pr_links.note_id").
			Joins("JOIN pull_requests ON note_pr_links.pr_id = pull_requests.id").
			Where("pull_requests.state = ?", prState)
	}

	var total int64
	query.Model(&models.Note{}).Count(&total)

	var notes []models.Note
	if err := query.Preload("PullRequests").
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&notes).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch notes")
		return
	}

	response := models.NotesResponse{
		Notes: notes,
		Total: total,
		Page:  page,
		Limit: limit,
	}

	utils.SuccessResponse(c, http.StatusOK, response)
}

func (h *NoteHandler) GetNote(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	noteIDStr := c.Param("id")
	noteID, err := uuid.Parse(noteIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid note ID")
		return
	}

	var note models.Note
	if err := database.DB.Where("id = ? AND user_id = ?", noteID, userID).
		Preload("PullRequests").
		First(&note).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Note not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, note)
}

func (h *NoteHandler) UpdateNote(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	noteIDStr := c.Param("id")
	noteID, err := uuid.Parse(noteIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid note ID")
		return
	}

	var req models.UpdateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var note models.Note
	if err := database.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Note not found")
		return
	}

	// Update basic fields
	note.Title = req.Title
	note.Content = req.Content
	note.GithubPRNumber = req.GithubPRNumber
	note.RepoOwner = req.RepoOwner
	note.RepoName = req.RepoName

	// Handle PR information update
	if req.GithubPRNumber != nil && req.RepoOwner != "" && req.RepoName != "" {
		// Get user for GitHub token
		var user models.User
		if err := database.DB.First(&user, userID).Error; err != nil {
			utils.ErrorResponse(c, http.StatusNotFound, "User not found")
			return
		}

		if user.GithubToken == "" {
			utils.ErrorResponse(c, http.StatusBadRequest, "GitHub token is required to fetch PR information")
			return
		}

		// Clear existing PR associations
		database.DB.Model(&note).Association("PullRequests").Clear()

		// Check if PR exists or fetch new one
		var existingPR models.PullRequest
		err := database.DB.Where("number = ? AND repo_owner = ? AND repo_name = ?",
			*req.GithubPRNumber, req.RepoOwner, req.RepoName).First(&existingPR).Error

		if err != nil {
			// Fetch from GitHub
			prData, err := h.githubService.GetPullRequest(req.RepoOwner, req.RepoName, *req.GithubPRNumber, user.GithubToken)
			if err != nil {
				utils.ErrorResponse(c, http.StatusBadRequest, "Failed to fetch PR information from GitHub: "+err.Error())
				return
			}

			existingPR = models.PullRequest{
				ID:        uuid.New(),
				Number:    prData.Number,
				RepoOwner: req.RepoOwner,
				RepoName:  req.RepoName,
				Title:     prData.Title,
				Body:      prData.Body,
				Author:    prData.User.Login,
				State:     prData.State,
				URL:       prData.HTMLURL,
			}

			if err := database.DB.Create(&existingPR).Error; err != nil {
				utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to save PR information")
				return
			}
		}

		// Associate with note
		database.DB.Model(&note).Association("PullRequests").Append(&existingPR)
	} else {
		// Clear PR associations if no PR info provided
		database.DB.Model(&note).Association("PullRequests").Clear()
	}

	if err := database.DB.Save(&note).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update note")
		return
	}

	// Fetch updated note with associations
	database.DB.Preload("PullRequests").First(&note, note.ID)

	utils.SuccessResponse(c, http.StatusOK, note)
}

func (h *NoteHandler) DeleteNote(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	noteIDStr := c.Param("id")
	noteID, err := uuid.Parse(noteIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid note ID")
		return
	}

	var note models.Note
	if err := database.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Note not found")
		return
	}

	// Clear associations first
	database.DB.Model(&note).Association("PullRequests").Clear()

	// Delete the note
	if err := database.DB.Delete(&note).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete note")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{"message": "Note deleted successfully"})
}
