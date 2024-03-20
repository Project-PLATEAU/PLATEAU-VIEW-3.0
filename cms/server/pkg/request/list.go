package request

type List []*Request

func (l List) UpdateStatus(state State) {
	for _, request := range l {
		request.SetState(state)
	}
}
