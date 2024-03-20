package gql

import (
	"context"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

func (r *mutationResolver) CreateGroup(ctx context.Context, input gqlmodel.CreateGroupInput) (*gqlmodel.GroupPayload, error) {
	pId, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}
	res, err := usecases(ctx).Group.Create(ctx, interfaces.CreateGroupParam{
		ProjectId:   pId,
		Name:        input.Name,
		Description: input.Description,
		Key:         input.Key,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.GroupPayload{
		Group: gqlmodel.ToGroup(res),
	}, nil
}

func (r *mutationResolver) UpdateGroup(ctx context.Context, input gqlmodel.UpdateGroupInput) (*gqlmodel.GroupPayload, error) {
	gid, err := gqlmodel.ToID[id.Group](input.GroupID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Group.Update(ctx, interfaces.UpdateGroupParam{
		GroupID:     gid,
		Name:        input.Name,
		Description: input.Description,
		Key:         input.Key,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.GroupPayload{
		Group: gqlmodel.ToGroup(res),
	}, nil
}

func (r *mutationResolver) DeleteGroup(ctx context.Context, input gqlmodel.DeleteGroupInput) (*gqlmodel.DeleteGroupPayload, error) {
	gid, err := gqlmodel.ToID[id.Group](input.GroupID)
	if err != nil {
		return nil, err
	}

	err = usecases(ctx).Group.Delete(ctx, gid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteGroupPayload{
		GroupID: input.GroupID,
	}, nil
}
