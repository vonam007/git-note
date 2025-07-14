package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github-notes-backend/internal/models"
)

type GitHubService struct{}

type GitHubError struct {
	Message          string `json:"message"`
	DocumentationURL string `json:"documentation_url"`
	Status           string `json:"status"`
}

func NewGitHubService() *GitHubService {
	return &GitHubService{}
}

func (s *GitHubService) GetPullRequest(owner, repo string, prNumber int, token string) (*models.GithubPullRequest, error) {
	// Validate inputs
	if owner == "" || repo == "" {
		return nil, fmt.Errorf("repository owner and name are required")
	}
	if prNumber <= 0 {
		return nil, fmt.Errorf("PR number must be greater than 0")
	}
	if token == "" {
		return nil, fmt.Errorf("GitHub token is required")
	}

	// Clean token (remove "ghp_" prefix if present and clean whitespace)
	token = strings.TrimSpace(token)

	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/pulls/%d", owner, repo, prNumber)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers for GitHub API v3
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	req.Header.Set("User-Agent", "GitHub-Notes-App/1.0")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request to GitHub API: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Handle different HTTP status codes
	switch resp.StatusCode {
	case http.StatusOK:
		// Success - parse PR data
		var pr models.GithubPullRequest
		if err := json.Unmarshal(body, &pr); err != nil {
			return nil, fmt.Errorf("failed to decode GitHub PR response: %w", err)
		}
		return &pr, nil

	case http.StatusNotFound:
		return nil, fmt.Errorf("PR #%d not found in repository %s/%s. Please check if the repository exists and the PR number is correct", prNumber, owner, repo)

	case http.StatusUnauthorized:
		return nil, fmt.Errorf("GitHub authentication failed. Please check your GitHub token and ensure it has the required permissions (public_repo, read:user)")

	case http.StatusForbidden:
		// Try to parse error message
		var githubErr GitHubError
		if json.Unmarshal(body, &githubErr) == nil && githubErr.Message != "" {
			return nil, fmt.Errorf("GitHub API access forbidden: %s. Please check your token permissions", githubErr.Message)
		}
		return nil, fmt.Errorf("GitHub API access forbidden. Your token may not have the required permissions or the repository may be private")

	case http.StatusTooManyRequests:
		return nil, fmt.Errorf("GitHub API rate limit exceeded. Please try again later")

	default:
		// Try to parse error message for other status codes
		var githubErr GitHubError
		if json.Unmarshal(body, &githubErr) == nil && githubErr.Message != "" {
			return nil, fmt.Errorf("GitHub API error (status %d): %s", resp.StatusCode, githubErr.Message)
		}
		return nil, fmt.Errorf("GitHub API returned unexpected status %d", resp.StatusCode)
	}
}
