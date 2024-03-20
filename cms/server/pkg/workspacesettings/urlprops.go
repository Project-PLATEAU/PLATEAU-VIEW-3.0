package workspacesettings

type UrlResourceProps struct {
	name  string
	url   string
	image string
}

func NewURLResourceProps(name, url, image string) UrlResourceProps {
	return UrlResourceProps{
		name:  name,
		url:   url,
		image: image,
	}
}

func (p UrlResourceProps) Name() string {
	return p.name
}

func (p UrlResourceProps) URL() string {
	return p.url
}

func (p UrlResourceProps) Image() string {
	return p.image
}