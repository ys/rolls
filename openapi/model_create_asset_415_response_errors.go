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

// CreateAsset415ResponseErrors struct for CreateAsset415ResponseErrors
type CreateAsset415ResponseErrors struct {
	ContentType []string `json:"content_type,omitempty"`
}

// NewCreateAsset415ResponseErrors instantiates a new CreateAsset415ResponseErrors object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewCreateAsset415ResponseErrors() *CreateAsset415ResponseErrors {
	this := CreateAsset415ResponseErrors{}
	return &this
}

// NewCreateAsset415ResponseErrorsWithDefaults instantiates a new CreateAsset415ResponseErrors object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewCreateAsset415ResponseErrorsWithDefaults() *CreateAsset415ResponseErrors {
	this := CreateAsset415ResponseErrors{}
	return &this
}

// GetContentType returns the ContentType field value if set, zero value otherwise.
func (o *CreateAsset415ResponseErrors) GetContentType() []string {
	if o == nil || o.ContentType == nil {
		var ret []string
		return ret
	}
	return o.ContentType
}

// GetContentTypeOk returns a tuple with the ContentType field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CreateAsset415ResponseErrors) GetContentTypeOk() ([]string, bool) {
	if o == nil || o.ContentType == nil {
		return nil, false
	}
	return o.ContentType, true
}

// HasContentType returns a boolean if a field has been set.
func (o *CreateAsset415ResponseErrors) HasContentType() bool {
	if o != nil && o.ContentType != nil {
		return true
	}

	return false
}

// SetContentType gets a reference to the given []string and assigns it to the ContentType field.
func (o *CreateAsset415ResponseErrors) SetContentType(v []string) {
	o.ContentType = v
}

func (o CreateAsset415ResponseErrors) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.ContentType != nil {
		toSerialize["content_type"] = o.ContentType
	}
	return json.Marshal(toSerialize)
}

type NullableCreateAsset415ResponseErrors struct {
	value *CreateAsset415ResponseErrors
	isSet bool
}

func (v NullableCreateAsset415ResponseErrors) Get() *CreateAsset415ResponseErrors {
	return v.value
}

func (v *NullableCreateAsset415ResponseErrors) Set(val *CreateAsset415ResponseErrors) {
	v.value = val
	v.isSet = true
}

func (v NullableCreateAsset415ResponseErrors) IsSet() bool {
	return v.isSet
}

func (v *NullableCreateAsset415ResponseErrors) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableCreateAsset415ResponseErrors(val *CreateAsset415ResponseErrors) *NullableCreateAsset415ResponseErrors {
	return &NullableCreateAsset415ResponseErrors{value: val, isSet: true}
}

func (v NullableCreateAsset415ResponseErrors) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableCreateAsset415ResponseErrors) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


