package plateauapi

import (
	"context"
	"fmt"
	"reflect"
	"slices"
	"sort"
	"strings"

	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

// Merger is a repository that merges multiple repositories. It returns the latest year data.
type Merger struct {
	repos              []Repo
	mergedDatasetTypes []ID
}

func NewMerger(repos ...Repo) *Merger {
	return &Merger{repos: repos}
}

var _ Repo = (*Merger)(nil)

func (m *Merger) Init(ctx context.Context) error {
	datasetTypes, err := m.datasetTypes(ctx, nil)
	if err != nil {
		return err
	}

	sortDatasetTypes(datasetTypes)
	m.mergedDatasetTypes = lo.Map(datasetTypes, func(dt DatasetType, _ int) ID {
		return dt.GetID()
	})

	return nil
}

func (m *Merger) Name() string {
	names := lo.Map(m.repos, func(r Repo, _ int) string {
		if r == nil {
			return "nil"
		}
		return r.Name()
	})
	return fmt.Sprintf("merger(%s)", strings.Join(names, ","))
}

func (m *Merger) Node(ctx context.Context, id ID) (Node, error) {
	nodes, err := getRepoResults(m.repos, func(r Repo) (Node, error) {
		return r.Node(ctx, id)
	})
	if err != nil {
		return nil, err
	}

	return getLatestYearNode(nodes), nil
}

func (m *Merger) Nodes(ctx context.Context, ids []ID) ([]Node, error) {
	nodes, err := getRepoResults(m.repos, func(r Repo) ([]Node, error) {
		return r.Nodes(ctx, ids)
	})
	if err != nil {
		return nil, err
	}

	res := lo.Map(zip(nodes...), func(n []Node, _ int) Node {
		return getLatestYearNode(n)
	})
	setOrderToNodes(res, m.mergedDatasetTypes)
	return res, nil
}

func (m *Merger) Area(ctx context.Context, code AreaCode) (Area, error) {
	areas, err := getRepoResults(m.repos, func(r Repo) (Area, error) {
		return r.Area(ctx, code)
	})
	if err != nil {
		return nil, err
	}

	return getLatestYearNode(areas), nil
}

func (m *Merger) Areas(ctx context.Context, input *AreasInput) ([]Area, error) {
	areas, err := getFlattenRepoResults(m.repos, func(r Repo) ([]Area, error) {
		return r.Areas(ctx, input)
	})
	if err != nil {
		return nil, err
	}

	return mergeResults(areas, true), nil
}

func (m *Merger) DatasetTypes(ctx context.Context, input *DatasetTypesInput) ([]DatasetType, error) {
	res, err := m.datasetTypes(ctx, input)
	if err != nil {
		return nil, err
	}

	sortDatasetTypes(res)
	setOrderToNodes(res, m.mergedDatasetTypes)
	return res, nil
}

func (m *Merger) Datasets(ctx context.Context, input *DatasetsInput) ([]Dataset, error) {
	datasets, err := getFlattenRepoResults(m.repos, func(r Repo) ([]Dataset, error) {
		return r.Datasets(ctx, input)
	})
	if err != nil {
		return nil, err
	}

	return mergeResults(datasets, true), nil
}

func (m *Merger) PlateauSpecs(ctx context.Context) ([]*PlateauSpec, error) {
	res, err := getFlattenRepoResults(m.repos, func(r Repo) ([]*PlateauSpec, error) {
		return r.PlateauSpecs(ctx)
	})
	if err != nil {
		return nil, err
	}

	return mergeResults(res, true), nil
}

func (m *Merger) Years(ctx context.Context) ([]int, error) {
	years, err := getRepoResults(m.repos, func(r Repo) ([]int, error) {
		return r.Years(ctx)
	})
	if err != nil {
		return nil, err
	}

	res := lo.Uniq(lo.Flatten(years))
	sort.Ints(res)
	return res, nil
}

func (m *Merger) datasetTypes(ctx context.Context, input *DatasetTypesInput) ([]DatasetType, error) {
	dts, err := getFlattenRepoResults(m.repos, func(r Repo) ([]DatasetType, error) {
		return r.DatasetTypes(ctx, input)
	})
	if err != nil {
		return nil, err
	}

	res := mergeResults(dts, false)
	return res, nil
}

func setOrderToNodes[T Node](nodes []T, mergedDatasetTypes []ID) {
	if mergedDatasetTypes == nil {
		return
	}

	for i, r := range nodes {
		if order := slices.Index(mergedDatasetTypes, r.GetID()); order >= 0 {
			setOrder(r, order+1)
			nodes[i] = r
		}
	}
}

func getRepoResults[T any](repos []Repo, f func(r Repo) (T, error)) ([]T, error) {
	return util.TryMap(repos, func(r Repo) (_ T, _ error) {
		if r == nil {
			return
		}
		res, err := f(r)
		if err != nil {
			return res, fmt.Errorf("repo %s: %w", r.Name(), err)
		}
		return res, nil
	})
}

func getFlattenRepoResults[T any](repos []Repo, f func(r Repo) ([]T, error)) ([]T, error) {
	res, err := getRepoResults(repos, f)
	if err != nil {
		return nil, err
	}

	return lo.Flatten(res), nil
}

func mergeResults[T Node](results []T, sort bool) []T {
	groups := lo.GroupBy(results, func(n T) string {
		if vid := getVagueID(n); vid != "" {
			return vid
		}
		return string(n.GetID())
	})

	res := make([]T, 0, len(groups))
	for _, g := range groups {
		res = append(res, getLatestYearNodes(g)...)
	}

	if sort {
		sortNodes(res)
	}
	return res
}

func sortNodes[T Node](nodes []T) {
	sort.Slice(nodes, func(i, j int) bool {
		i1, i2 := nodes[i].GetID(), nodes[j].GetID()
		if i1 != i2 {
			return i1 < i2
		}

		return getYear(nodes[i]) > getYear(nodes[j])
	})
}

func sortDatasetTypes[T DatasetType](nodes []T) {
	slices.SortStableFunc(nodes, func(a, b T) int {
		y1, y2 := getYear(a), getYear(b)
		if y1 != y2 {
			return y2 - y1
		}

		o1, o2 := getOrder(a), getOrder(b)
		if o1 != nil && o2 != nil {
			return *o1 - *o2
		}

		return 0
	})
}

func getLatestYearNodes[T Node](nodes []T) []T {
	targets := make([]T, 0, len(nodes))
	maxYear := 0
	found := false

	for _, r := range nodes {
		if !isPresent(r) {
			continue
		}

		targets = append(targets, r)
		if y := getYear(r); y > maxYear {
			maxYear = y
			found = true
		}
	}

	if !found {
		return uniqueByID(targets)
	}

	targets = lo.Filter(targets, func(a T, i int) bool {
		return getYear(a) == maxYear
	})
	return uniqueByID(targets)
}

func uniqueByID[T Node](nodes []T) []T {
	if len(nodes) <= 1 {
		return nodes
	}
	ids := make(map[ID]struct{})
	res := make([]T, 0, len(nodes))
	for _, n := range nodes {
		if id := n.GetID(); id != "" {
			if _, ok := ids[id]; ok {
				continue
			}
			ids[id] = struct{}{}
		}
		res = append(res, n)
	}
	return res
}

func getLatestYearNode[T any](results []T) T {
	results = lo.Filter(results, func(a T, _ int) bool {
		return isPresent(a)
	})
	max := lo.MaxBy(results, func(a, b T) bool {
		ya, yb := getYear(a), getYear(b)
		return ya > yb
	})
	return max
}

func zip[T any](a ...[]T) [][]T {
	if len(a) == 0 {
		return nil
	}
	res := make([][]T, len(a[0]))
	for i := range res {
		res[i] = make([]T, len(a))
	}
	for i, aa := range a {
		for j, v := range aa {
			res[j][i] = v
		}
	}
	return res
}

type YearNode interface {
	GetYear() int
}

type OrderNode interface {
	GetOrder() int
}

func isPresent(n any) bool {
	if n == nil {
		return false
	}
	v := reflect.ValueOf(n)
	return v.Kind() != reflect.Ptr || !v.IsNil()
}

func getYear(n any) int {
	if yn, ok := n.(YearNode); ok {
		return yn.GetYear()
	}
	return 0
}

func getOrder(n any) *int {
	if yn, ok := n.(OrderNode); ok {
		return lo.ToPtr(yn.GetOrder())
	}
	return nil
}

func setOrder(n any, order int) {
	switch v := n.(type) {
	case *PlateauDatasetType:
		v.Order = order
	case *RelatedDatasetType:
		v.Order = order
	case *GenericDatasetType:
		v.Order = order
	}
}
