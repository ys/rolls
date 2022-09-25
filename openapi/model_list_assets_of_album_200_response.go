/*
Lightroom API Documentation

Lightroom API Documentation, made available through [adobe.io](https://developer.adobe.com). API Change Logs are available [here](https://developer.adobe.com/lightroom/lightroom-api-docs/release-notes/).

API version: 1.0.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package openapi

import (
	"encoding/json"
)

// ListAssetsOfAlbum200Response struct for ListAssetsOfAlbum200Response
type ListAssetsOfAlbum200Response struct {
	// Base URL that can be prepended to the 'href' values in the 'links' to produce fully qualified URLs for future queries.
	Base *string `json:"base,omitempty"`
	Album *ListAssetsOfAlbum200ResponseAlbum `json:"album,omitempty"`
	Resources []ListAssetsOfAlbum200ResponseResourcesInner `json:"resources,omitempty"`
	Links map[string]interface{} `json:"links,omitempty"`
}

// NewListAssetsOfAlbum200Response instantiates a new ListAssetsOfAlbum200Response object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewListAssetsOfAlbum200Response() *ListAssetsOfAlbum200Response {
	this := ListAssetsOfAlbum200Response{}
	return &this
}

// NewListAssetsOfAlbum200ResponseWithDefaults instantiates a new ListAssetsOfAlbum200Response object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewListAssetsOfAlbum200ResponseWithDefaults() *ListAssetsOfAlbum200Response {
	this := ListAssetsOfAlbum200Response{}
	return &this
}

// GetBase returns the Base field value if set, zero value otherwise.
func (o *ListAssetsOfAlbum200Response) GetBase() string {
	if o == nil || o.Base == nil {
		var ret string
		return ret
	}
	return *o.Base
}

// GetBaseOk returns a tuple with the Base field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ListAssetsOfAlbum200Response) GetBaseOk() (*string, bool) {
	if o == nil || o.Base == nil {
		return nil, false
	}
	return o.Base, true
}

// HasBase returns a boolean if a field has been set.
func (o *ListAssetsOfAlbum200Response) HasBase() bool {
	if o != nil && o.Base != nil {
		return true
	}

	return false
}

// SetBase gets a reference to the given string and assigns it to the Base field.
func (o *ListAssetsOfAlbum200Response) SetBase(v string) {
	o.Base = &v
}

// GetAlbum returns the Album field value if set, zero value otherwise.
func (o *ListAssetsOfAlbum200Response) GetAlbum() ListAssetsOfAlbum200ResponseAlbum {
	if o == nil || o.Album == nil {
		var ret ListAssetsOfAlbum200ResponseAlbum
		return ret
	}
	return *o.Album
}

// GetAlbumOk returns a tuple with the Album field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ListAssetsOfAlbum200Response) GetAlbumOk() (*ListAssetsOfAlbum200ResponseAlbum, bool) {
	if o == nil || o.Album == nil {
		return nil, false
	}
	return o.Album, true
}

// HasAlbum returns a boolean if a field has been set.
func (o *ListAssetsOfAlbum200Response) HasAlbum() bool {
	if o != nil && o.Album != nil {
		return true
	}

	return false
}

// SetAlbum gets a reference to the given ListAssetsOfAlbum200ResponseAlbum and assigns it to the Album field.
func (o *ListAssetsOfAlbum200Response) SetAlbum(v ListAssetsOfAlbum200ResponseAlbum) {
	o.Album = &v
}

// GetResources returns the Resources field value if set, zero value otherwise.
func (o *ListAssetsOfAlbum200Response) GetResources() []ListAssetsOfAlbum200ResponseResourcesInner {
	if o == nil || o.Resources == nil {
		var ret []ListAssetsOfAlbum200ResponseResourcesInner
		return ret
	}
	return o.Resources
}

// GetResourcesOk returns a tuple with the Resources field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ListAssetsOfAlbum200Response) GetResourcesOk() ([]ListAssetsOfAlbum200ResponseResourcesInner, bool) {
	if o == nil || o.Resources == nil {
		return nil, false
	}
	return o.Resources, true
}

// HasResources returns a boolean if a field has been set.
func (o *ListAssetsOfAlbum200Response) HasResources() bool {
	if o != nil && o.Resources != nil {
		return true
	}

	return false
}

// SetResources gets a reference to the given []ListAssetsOfAlbum200ResponseResourcesInner and assigns it to the Resources field.
func (o *ListAssetsOfAlbum200Response) SetResources(v []ListAssetsOfAlbum200ResponseResourcesInner) {
	o.Resources = v
}

// GetLinks returns the Links field value if set, zero value otherwise.
func (o *ListAssetsOfAlbum200Response) GetLinks() map[string]interface{} {
	if o == nil || o.Links == nil {
		var ret map[string]interface{}
		return ret
	}
	return o.Links
}

// GetLinksOk returns a tuple with the Links field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ListAssetsOfAlbum200Response) GetLinksOk() (map[string]interface{}, bool) {
	if o == nil || o.Links == nil {
		return nil, false
	}
	return o.Links, true
}

// HasLinks returns a boolean if a field has been set.
func (o *ListAssetsOfAlbum200Response) HasLinks() bool {
	if o != nil && o.Links != nil {
		return true
	}

	return false
}

// SetLinks gets a reference to the given map[string]interface{} and assigns it to the Links field.
func (o *ListAssetsOfAlbum200Response) SetLinks(v map[string]interface{}) {
	o.Links = v
}

func (o ListAssetsOfAlbum200Response) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Base != nil {
		toSerialize["base"] = o.Base
	}
	if o.Album != nil {
		toSerialize["album"] = o.Album
	}
	if o.Resources != nil {
		toSerialize["resources"] = o.Resources
	}
	if o.Links != nil {
		toSerialize["links"] = o.Links
	}
	return json.Marshal(toSerialize)
}

type NullableListAssetsOfAlbum200Response struct {
	value *ListAssetsOfAlbum200Response
	isSet bool
}

func (v NullableListAssetsOfAlbum200Response) Get() *ListAssetsOfAlbum200Response {
	return v.value
}

func (v *NullableListAssetsOfAlbum200Response) Set(val *ListAssetsOfAlbum200Response) {
	v.value = val
	v.isSet = true
}

func (v NullableListAssetsOfAlbum200Response) IsSet() bool {
	return v.isSet
}

func (v *NullableListAssetsOfAlbum200Response) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableListAssetsOfAlbum200Response(val *ListAssetsOfAlbum200Response) *NullableListAssetsOfAlbum200Response {
	return &NullableListAssetsOfAlbum200Response{value: val, isSet: true}
}

func (v NullableListAssetsOfAlbum200Response) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableListAssetsOfAlbum200Response) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


