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

// GetAlbums200Response struct for GetAlbums200Response
type GetAlbums200Response struct {
	// Base URL that can be prepended to the 'href' values in the 'links' to produce fully qualified URLs for future queries.
	Base *string `json:"base,omitempty"`
	Resources []GetAlbums200ResponseResourcesInner `json:"resources,omitempty"`
}

// NewGetAlbums200Response instantiates a new GetAlbums200Response object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewGetAlbums200Response() *GetAlbums200Response {
	this := GetAlbums200Response{}
	return &this
}

// NewGetAlbums200ResponseWithDefaults instantiates a new GetAlbums200Response object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewGetAlbums200ResponseWithDefaults() *GetAlbums200Response {
	this := GetAlbums200Response{}
	return &this
}

// GetBase returns the Base field value if set, zero value otherwise.
func (o *GetAlbums200Response) GetBase() string {
	if o == nil || o.Base == nil {
		var ret string
		return ret
	}
	return *o.Base
}

// GetBaseOk returns a tuple with the Base field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAlbums200Response) GetBaseOk() (*string, bool) {
	if o == nil || o.Base == nil {
		return nil, false
	}
	return o.Base, true
}

// HasBase returns a boolean if a field has been set.
func (o *GetAlbums200Response) HasBase() bool {
	if o != nil && o.Base != nil {
		return true
	}

	return false
}

// SetBase gets a reference to the given string and assigns it to the Base field.
func (o *GetAlbums200Response) SetBase(v string) {
	o.Base = &v
}

// GetResources returns the Resources field value if set, zero value otherwise.
func (o *GetAlbums200Response) GetResources() []GetAlbums200ResponseResourcesInner {
	if o == nil || o.Resources == nil {
		var ret []GetAlbums200ResponseResourcesInner
		return ret
	}
	return o.Resources
}

// GetResourcesOk returns a tuple with the Resources field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAlbums200Response) GetResourcesOk() ([]GetAlbums200ResponseResourcesInner, bool) {
	if o == nil || o.Resources == nil {
		return nil, false
	}
	return o.Resources, true
}

// HasResources returns a boolean if a field has been set.
func (o *GetAlbums200Response) HasResources() bool {
	if o != nil && o.Resources != nil {
		return true
	}

	return false
}

// SetResources gets a reference to the given []GetAlbums200ResponseResourcesInner and assigns it to the Resources field.
func (o *GetAlbums200Response) SetResources(v []GetAlbums200ResponseResourcesInner) {
	o.Resources = v
}

func (o GetAlbums200Response) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Base != nil {
		toSerialize["base"] = o.Base
	}
	if o.Resources != nil {
		toSerialize["resources"] = o.Resources
	}
	return json.Marshal(toSerialize)
}

type NullableGetAlbums200Response struct {
	value *GetAlbums200Response
	isSet bool
}

func (v NullableGetAlbums200Response) Get() *GetAlbums200Response {
	return v.value
}

func (v *NullableGetAlbums200Response) Set(val *GetAlbums200Response) {
	v.value = val
	v.isSet = true
}

func (v NullableGetAlbums200Response) IsSet() bool {
	return v.isSet
}

func (v *NullableGetAlbums200Response) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableGetAlbums200Response(val *GetAlbums200Response) *NullableGetAlbums200Response {
	return &NullableGetAlbums200Response{value: val, isSet: true}
}

func (v NullableGetAlbums200Response) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableGetAlbums200Response) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


