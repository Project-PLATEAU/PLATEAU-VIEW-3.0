package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/account/accountdomain"
)

func (r *mutationResolver) UpdateWorkspaceSettings(ctx context.Context, input gqlmodel.UpdateWorkspaceSettingsInput) (*gqlmodel.UpdateWorkspaceSettingsPayload, error) {
	wid, err := gqlmodel.ToID[accountdomain.Workspace](input.ID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).WorkspaceSettings.UpdateOrCreate(ctx, interfaces.UpdateOrCreateWorkspaceSettingsParam{
		ID:       wid,
		Tiles:    gqlmodel.FromResourceList(input.Tiles),
		Terrains: gqlmodel.FromResourceList(input.Terrains),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateWorkspaceSettingsPayload{WorkspaceSettings: gqlmodel.ToWorkspaceSettings(res)}, nil
}
