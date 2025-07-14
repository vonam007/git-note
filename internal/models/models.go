package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID             uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Email          string    `json:"email" gorm:"uniqueIndex;not null"`
	PasswordHash   string    `json:"-" gorm:"not null"`
	GithubUsername string    `json:"github_username" gorm:""`
	GithubToken    string    `json:"-" gorm:""`
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	Notes          []Note    `json:"notes,omitempty" gorm:"foreignKey:UserID"`
}

type Note struct {
	ID             uuid.UUID     `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID         uuid.UUID     `json:"user_id" gorm:"type:uuid;not null"`
	Title          string        `json:"title" gorm:"type:varchar(255);not null"`
	Content        string        `json:"content" gorm:"type:text"`
	GithubPRNumber *int          `json:"github_pr_number,omitempty" gorm:""`
	RepoOwner      string        `json:"repo_owner,omitempty" gorm:""`
	RepoName       string        `json:"repo_name,omitempty" gorm:""`
	CreatedAt      time.Time     `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time     `json:"updated_at" gorm:"autoUpdateTime"`
	User           User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	PullRequests   []PullRequest `json:"pull_requests,omitempty" gorm:"many2many:note_pr_links;"`
}

type PullRequest struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Number    int       `json:"number" gorm:"not null"`
	RepoOwner string    `json:"repo_owner" gorm:"not null"`
	RepoName  string    `json:"repo_name" gorm:"not null"`
	Title     string    `json:"title" gorm:"not null"`
	Body      string    `json:"body" gorm:"type:text"`
	Author    string    `json:"author" gorm:"not null"`
	State     string    `json:"state" gorm:"not null"`
	URL       string    `json:"url" gorm:"not null"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	Notes     []Note    `json:"notes,omitempty" gorm:"many2many:note_pr_links;"`
}

type NotePRLink struct {
	NoteID uuid.UUID `json:"note_id" gorm:"type:uuid;primaryKey"`
	PRID   uuid.UUID `json:"pr_id" gorm:"type:uuid;primaryKey"`
}

// Request/Response DTOs
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type UpdateProfileRequest struct {
	GithubUsername string `json:"github_username"`
	GithubToken    string `json:"github_token"`
}

type CreateNoteRequest struct {
	Title          string `json:"title" binding:"required,max=255"`
	Content        string `json:"content"`
	GithubPRNumber *int   `json:"github_pr_number,omitempty"`
	RepoOwner      string `json:"repo_owner,omitempty"`
	RepoName       string `json:"repo_name,omitempty"`
}

type UpdateNoteRequest struct {
	Title          string `json:"title" binding:"required,max=255"`
	Content        string `json:"content"`
	GithubPRNumber *int   `json:"github_pr_number,omitempty"`
	RepoOwner      string `json:"repo_owner,omitempty"`
	RepoName       string `json:"repo_name,omitempty"`
}

type NotesResponse struct {
	Notes []Note `json:"notes"`
	Total int64  `json:"total"`
	Page  int    `json:"page"`
	Limit int    `json:"limit"`
}

type GithubPullRequest struct {
	ID     int    `json:"id"`
	Number int    `json:"number"`
	Title  string `json:"title"`
	Body   string `json:"body"`
	State  string `json:"state"`
	User   struct {
		Login string `json:"login"`
	} `json:"user"`
	HTMLURL   string    `json:"html_url"`
	CreatedAt time.Time `json:"created_at"`
}

// BeforeCreate hooks
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

func (n *Note) BeforeCreate(tx *gorm.DB) error {
	if n.ID == uuid.Nil {
		n.ID = uuid.New()
	}
	return nil
}

func (pr *PullRequest) BeforeCreate(tx *gorm.DB) error {
	if pr.ID == uuid.Nil {
		pr.ID = uuid.New()
	}
	return nil
}
