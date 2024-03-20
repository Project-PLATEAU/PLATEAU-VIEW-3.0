package app

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/k0kubun/pp/v3"
	"github.com/kelseyhightower/envconfig"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/aws"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/gcp"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

const configPrefix = "REEARTH_CMS"

func init() {
	pp.Default.SetColoringEnabled(false)
}

type Config struct {
	Port         string            `default:"8080" envconfig:"PORT"`
	ServerHost   string            `pp:",omitempty"`
	Host         string            `default:"http://localhost:8080"`
	Dev          bool              `pp:",omitempty"`
	Host_Web     string            `pp:",omitempty"`
	GraphQL      GraphQLConfig     `pp:",omitempty"`
	Origins      []string          `pp:",omitempty"`
	DB           string            `default:"mongodb://localhost"`
	Mailer       string            `pp:",omitempty"`
	SMTP         SMTPConfig        `pp:",omitempty"`
	SendGrid     SendGridConfig    `pp:",omitempty"`
	SignupSecret string            `pp:",omitempty"`
	GCS          GCSConfig         `pp:",omitempty"`
	S3           S3Config          `pp:",omitempty"`
	Task         gcp.TaskConfig    `pp:",omitempty"`
	AWSTask      aws.TaskConfig    `pp:",omitempty"`
	AssetBaseURL string            `pp:",omitempty"`
	Web          map[string]string `pp:",omitempty"`
	Web_Config   JSON              `pp:",omitempty"`
	Web_Disabled bool              `pp:",omitempty"`
	// auth
	Auth          AuthConfigs   `pp:",omitempty"`
	Auth0         Auth0Config   `pp:",omitempty"`
	Cognito       CognitoConfig `pp:",omitempty"`
	Auth_ISS      string        `pp:",omitempty"`
	Auth_AUD      string        `pp:",omitempty"`
	Auth_ALG      *string       `pp:",omitempty"`
	Auth_TTL      *int          `pp:",omitempty"`
	Auth_ClientID *string       `pp:",omitempty"`
	Auth_JWKSURI  *string       `pp:",omitempty"`
	// auth for m2m
	AuthM2M AuthM2MConfig `pp:",omitempty"`

	DB_Account string          `pp:",omitempty"`
	DB_Users   []appx.NamedURI `pp:",omitempty"`
}

type AuthConfig struct {
	ISS      string   `pp:",omitempty"`
	AUD      []string `pp:",omitempty"`
	ALG      *string  `pp:",omitempty"`
	TTL      *int     `pp:",omitempty"`
	ClientID *string  `pp:",omitempty"`
	JWKSURI  *string  `pp:",omitempty"`
}

type GraphQLConfig struct {
	ComplexityLimit int `default:"6000"`
}

type AuthConfigs []AuthConfig

type Auth0Config struct {
	Domain       string `pp:",omitempty"`
	Audience     string `pp:",omitempty"`
	ClientID     string `pp:",omitempty"`
	ClientSecret string `pp:",omitempty"`
	WebClientID  string `pp:",omitempty"`
}

type CognitoConfig struct {
	UserPoolID string `pp:",omitempty"`
	Region     string `pp:",omitempty"`
	ClientID   string `pp:",omitempty"`
}

type SendGridConfig struct {
	Email string `pp:",omitempty"`
	Name  string `pp:",omitempty"`
	API   string `pp:",omitempty"`
}

type SMTPConfig struct {
	Host         string `pp:",omitempty"`
	Port         string `pp:",omitempty"`
	SMTPUsername string `pp:",omitempty"`
	Email        string `pp:",omitempty"`
	Password     string `pp:",omitempty"`
}

type GCSConfig struct {
	BucketName              string `pp:",omitempty"`
	PublicationCacheControl string `pp:",omitempty"`
}

type S3Config struct {
	BucketName              string `pp:",omitempty"`
	PublicationCacheControl string `pp:",omitempty"`
}

type AuthM2MConfig struct {
	ISS     string   `pp:",omitempty"`
	AUD     []string `pp:",omitempty"`
	ALG     *string  `pp:",omitempty"`
	TTL     *int     `pp:",omitempty"`
	Email   string   `pp:",omitempty"`
	JWKSURI *string  `pp:",omitempty"`
}

func (c *Config) Auths() (res AuthConfigs) {
	if cc := c.Cognito.Configs(); cc != nil {
		return cc
	}

	if ac := c.Auth0.AuthConfig(); ac != nil {
		res = append(res, *ac)
	}
	if c.Auth_ISS != "" {
		var aud []string
		if len(c.Auth_AUD) > 0 {
			aud = append(aud, c.Auth_AUD)
		}
		res = append(res, AuthConfig{
			ISS:      c.Auth_ISS,
			AUD:      aud,
			ALG:      c.Auth_ALG,
			TTL:      c.Auth_TTL,
			ClientID: c.Auth_ClientID,
			JWKSURI:  c.Auth_JWKSURI,
		})
	}

	return append(res, c.Auth...)
}

func (c *Config) JWTProviders() (res []appx.JWTProvider) {
	return c.Auths().JWTProviders()
}

func (c *Config) AuthForWeb() *AuthConfig {
	if ac := c.Auth0.AuthConfigForWeb(); ac != nil {
		return ac
	}
	if c.Auth_ISS != "" {
		var aud []string
		if len(c.Auth_AUD) > 0 {
			aud = append(aud, c.Auth_AUD)
		}
		return &AuthConfig{
			ISS:      c.Auth_ISS,
			AUD:      aud,
			ALG:      c.Auth_ALG,
			TTL:      c.Auth_TTL,
			ClientID: c.Auth_ClientID,
		}
	}
	// if ac := c.AuthSrv.AuthConfig(c.Dev, c.Host); ac != nil {
	// 	return ac
	// }
	return nil
}

func (c Auth0Config) AuthConfig() *AuthConfig {
	domain := c.Domain
	if c.Domain == "" {
		return nil
	}
	if !strings.HasPrefix(domain, "https://") && !strings.HasPrefix(domain, "http://") {
		domain = "https://" + domain
	}
	if !strings.HasSuffix(domain, "/") {
		domain = domain + "/"
	}
	aud := []string{}
	if c.Audience != "" {
		aud = append(aud, c.Audience)
	}
	return &AuthConfig{
		ISS: domain,
		AUD: aud,
	}
}

func (c Auth0Config) AuthConfigForWeb() *AuthConfig {
	if c.Domain == "" || c.WebClientID == "" {
		return nil
	}
	domain := prepareUrl(c.Domain)
	var aud []string
	if len(c.Audience) > 0 {
		aud = []string{c.Audience}
	}
	return &AuthConfig{
		ISS:      domain,
		AUD:      aud,
		ClientID: &c.WebClientID,
	}
}

func (a AuthConfig) JWTProvider() appx.JWTProvider {
	return appx.JWTProvider{
		ISS:     a.ISS,
		AUD:     a.AUD,
		ALG:     a.ALG,
		TTL:     a.TTL,
		JWKSURI: a.JWKSURI,
	}
}

func (a AuthM2MConfig) JWTProvider() []appx.JWTProvider {
	domain := a.ISS
	if a.ISS == "" {
		return nil
	}
	if !strings.HasPrefix(domain, "https://") && !strings.HasPrefix(domain, "http://") {
		domain = "https://" + domain
	}

	return []appx.JWTProvider{{
		ISS:     domain,
		AUD:     a.AUD,
		ALG:     a.ALG,
		TTL:     a.TTL,
		JWKSURI: a.JWKSURI,
	}}
}

// Cognito
func (c CognitoConfig) Configs() AuthConfigs {
	if c.UserPoolID == "" || c.Region == "" || c.ClientID == "" {
		return nil
	}
	return AuthConfigs{
		AuthConfig{
			ISS:      fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s", c.Region, c.UserPoolID),
			AUD:      []string{c.ClientID},
			ClientID: &c.ClientID,
			JWKSURI:  lo.ToPtr(fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", c.Region, c.UserPoolID)),
		},
	}
}

// Decode is a custom decoder for AuthConfigs
func (ipd *AuthConfigs) Decode(value string) error {
	if value == "" {
		return nil
	}

	var providers []AuthConfig

	err := json.Unmarshal([]byte(value), &providers)
	if err != nil {
		return fmt.Errorf("invalid identity providers json: %w", err)
	}

	*ipd = providers
	return nil
}

func (a AuthConfigs) JWTProviders() []appx.JWTProvider {
	return lo.Map(a, func(a AuthConfig, _ int) appx.JWTProvider { return a.JWTProvider() })
}

func ReadConfig(debug bool) (*Config, error) {
	// load .env
	if err := godotenv.Load(".env"); err != nil && !os.IsNotExist(err) {
		return nil, err
	} else if err == nil {
		log.Infof("config: .env loaded")
	}

	var c Config
	err := envconfig.Process(configPrefix, &c)

	if debug {
		c.Dev = true
	}

	return &c, err
}

func (c *Config) Print() string {
	s := pp.Sprint(c)

	for _, secret := range c.secrets() {
		if secret == "" {
			continue
		}
		s = strings.ReplaceAll(s, secret, "***")
	}

	return s
}

func (c *Config) secrets() []string {
	s := []string{
		c.DB,
		c.Auth0.ClientSecret,
	}
	for _, d := range c.DB_Users {
		s = append(s, d.URI)
	}
	return s
}

func prepareUrl(url string) string {
	if !strings.HasPrefix(url, "https://") && !strings.HasPrefix(url, "http://") {
		url = "https://" + url
	}
	url = strings.TrimSuffix(url, "/")
	return url
}

func (c *Config) WebConfig() map[string]any {
	config := make(map[string]any)

	if ac := c.AuthForWeb(); ac != nil {
		if ac.ISS != "" {
			config["auth0Domain"] = strings.TrimSuffix(ac.ISS, "/")
		}
		if ac.ClientID != nil {
			config["auth0ClientId"] = *ac.ClientID
		}
		if len(ac.AUD) > 0 {
			config["auth0Audience"] = ac.AUD[0]
		}
	}

	for k, v := range c.Web {
		config[k] = v
	}
	if m := c.Web_Config.Object(); m != nil {
		for k, v := range m {
			config[k] = v
		}
	}

	return config
}

type JSON struct {
	Data any
}

func (j *JSON) Decode(value string) error {
	if value == "" {
		return nil
	}
	return json.Unmarshal([]byte(value), &j.Data)
}

func (j *JSON) Object() map[string]any {
	if j == nil {
		return nil
	}
	if m, ok := j.Data.(map[string]any); ok {
		w := make(map[string]any)
		for k, v := range m {
			w[k] = v
		}
		return w
	}
	return nil
}
