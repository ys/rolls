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

// CreateAssetOriginal413Response struct for CreateAssetOriginal413Response
type CreateAssetOriginal413Response struct {
	Code *int32 `json:"code,omitempty"`
	Description *string `json:"description,omitempty"`
}

// NewCreateAssetOriginal413Response instantiates a new CreateAssetOriginal413Response object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewCreateAssetOriginal413Response() *CreateAssetOriginal413Response {
	this := CreateAssetOriginal413Response{}
	return &this
}

// NewCreateAssetOriginal413ResponseWithDefaults instantiates a new CreateAssetOriginal413Response object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewCreateAssetOriginal413ResponseWithDefaults() *CreateAssetOriginal413Response {
	this := CreateAssetOriginal413Response{}
	return &this
}

// GetCode returns the Code field value if set, zero value otherwise.
func (o *CreateAssetOriginal413Response) GetCode() int32 {
	if o == nil || o.Code == nil {
		var ret int32
		return ret
	}
	return *o.Code
}

// GetCodeOk returns a tuple with the Code field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CreateAssetOriginal413Response) GetCodeOk() (*int32, bool) {
	if o == nil || o.Code == nil {
		return nil, false
	}
	return o.Code, true
}

// HasCode returns a boolean if a field has been set.
func (o *CreateAssetOriginal413Response) HasCode() bool {
	if o != nil && o.Code != nil {
		return true
	}

	return false
}

// SetCode gets a reference to the given int32 and assigns it to the Code field.
func (o *CreateAssetOriginal413Response) SetCode(v int32) {
	o.Code = &v
}

// GetDescription returns the Description field value if set, zero value otherwise.
func (o *CreateAssetOriginal413Response) GetDescription() string {
	if o == nil || o.Description == nil {
		var ret string
		return ret
	}
	return *o.Description
}

// GetDescriptionOk returns a tuple with the Description field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CreateAssetOriginal413Response) GetDescriptionOk() (*string, bool) {
	if o == nil || o.Description == nil {
		return nil, false
	}
	return o.Description, true
}

// HasDescription returns a boolean if a field has been set.
func (o *CreateAssetOriginal413Response) HasDescription() bool {
	if o != nil && o.Description != nil {
		return true
	}

	return false
}

// SetDescription gets a reference to the given string and assigns it to the Description field.
func (o *CreateAssetOriginal413Response) SetDescription(v string) {
	o.Description = &v
}

func (o CreateAssetOriginal413Response) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Code != nil {
		toSerialize["code"] = o.Code
	}
	if o.Description != nil {
		toSerialize["description"] = o.Description
	}
	return json.Marshal(toSerialize)
}

type NullableCreateAssetOriginal413Response struct {
	value *CreateAssetOriginal413Response
	isSet bool
}

func (v NullableCreateAssetOriginal413Response) Get() *CreateAssetOriginal413Response {
	return v.value
}

func (v *NullableCreateAssetOriginal413Response) Set(val *CreateAssetOriginal413Response) {
	v.value = val
	v.isSet = true
}

func (v NullableCreateAssetOriginal413Response) IsSet() bool {
	return v.isSet
}

func (v *NullableCreateAssetOriginal413Response) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableCreateAssetOriginal413Response(val *CreateAssetOriginal413Response) *NullableCreateAssetOriginal413Response {
	return &NullableCreateAssetOriginal413Response{value: val, isSet: true}
}

func (v NullableCreateAssetOriginal413Response) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableCreateAssetOriginal413Response) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


