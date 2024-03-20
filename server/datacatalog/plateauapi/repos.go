package plateauapi

import (
	"context"
	"fmt"
	"slices"
	"sort"
	"time"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

const cacheUpdateDuration = 10 * time.Second

type ReposUpdater = func(ctx context.Context, project string) (*ReposUpdateResult, error)

type ReposUpdateResult struct {
	Repo     Repo
	Warnings []string
}

type Repos struct {
	updater   ReposUpdater
	locks     util.LockMap[string]
	repos     map[string]*RepoWrapper
	warnings  map[string][]string
	updatedAt map[string]time.Time
	now       func() time.Time
}

func NewRepos(u ReposUpdater) *Repos {
	return &Repos{
		updater:   u,
		locks:     util.LockMap[string]{},
		repos:     map[string]*RepoWrapper{},
		warnings:  map[string][]string{},
		updatedAt: map[string]time.Time{},
	}
}

func (r *Repos) Prepare(ctx context.Context, project string, year int, cms cms.Interface) error {
	_, err := r.Update(ctx, project)
	return err
}

func (r *Repos) Repo(project string) *RepoWrapper {
	return r.repos[project]
}

func (r *Repos) Projects() []string {
	keys := lo.Keys(r.repos)
	sort.Strings(keys)
	return keys
}

func (r *Repos) UpdateAll(ctx context.Context) error {
	projects := r.Projects()
	for _, project := range projects {
		if _, err := r.Update(ctx, project); err != nil {
			return fmt.Errorf("failed to update project %s: %w", project, err)
		}
	}
	return nil
}

// Update updates the project's repo if it's not updated recently. If false is returned, it means the repo is not updated.
func (r *Repos) Update(ctx context.Context, project string) (bool, error) {
	r.locks.Lock(project)
	defer r.locks.Unlock(project)

	// avoid too frequent updates
	updated := r.UpdatedAt(project)
	since := r.getNow().Sub(updated)
	if !updated.IsZero() && since < cacheUpdateDuration {
		return false, nil
	}

	// update
	ur, err := r.updater(ctx, project)
	if err != nil {
		return false, fmt.Errorf("failed to update project %s: %w", project, err)
	}

	u := false
	if ur != nil {
		if ur.Repo != nil {
			repoWrapper := r.repos[project]
			if repoWrapper == nil {
				repoWrapper = NewRepoWrapper(ur.Repo, nil)
				repoWrapper.SetName(project)
				r.repos[project] = repoWrapper
			} else {
				repoWrapper.SetRepo(ur.Repo)
			}

			u = true
		}

		r.warnings[project] = ur.Warnings
	}

	if u {
		r.updatedAt[project] = r.getNow()
	}
	return u, nil
}

func (r *Repos) Warnings(project string) []string {
	if r.UpdatedAt(project).IsZero() {
		return []string{"project is not initialized"}
	}
	return slices.Clone(r.warnings[project])
}

func (r *Repos) UpdatedAt(project string) time.Time {
	return r.updatedAt[project]
}

func (r *Repos) getNow() time.Time {
	if r.now != nil {
		return r.now()
	}
	return time.Now()
}
