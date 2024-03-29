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

// ForbiddenKeyError struct for ForbiddenKeyError
type ForbiddenKeyError struct {
	Code *int32 `json:"code,omitempty"`
	Description *string `json:"description,omitempty"`
}

// NewForbiddenKeyError instantiates a new ForbiddenKeyError object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewForbiddenKeyError() *ForbiddenKeyError {
	this := ForbiddenKeyError{}
	return &this
}

// NewForbiddenKeyErrorWithDefaults instantiates a new ForbiddenKeyError object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewForbiddenKeyErrorWithDefaults() *ForbiddenKeyError {
	this := ForbiddenKeyError{}
	return &this
}

// GetCode returns the Code field value if set, zero value otherwise.
func (o *ForbiddenKeyError) GetCode() int32 {
	if o == nil || o.Code == nil {
		var ret int32
		return ret
	}
	return *o.Code
}

// GetCodeOk returns a tuple with the Code field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ForbiddenKeyError) GetCodeOk() (*int32, bool) {
	if o == nil || o.Code == nil {
		return nil, false
	}
	return o.Code, true
}

// HasCode returns a boolean if a field has been set.
func (o *ForbiddenKeyError) HasCode() bool {
	if o != nil && o.Code != nil {
		return true
	}

	return false
}

// SetCode gets a reference to the given int32 and assigns it to the Code field.
func (o *ForbiddenKeyError) SetCode(v int32) {
	o.Code = &v
}

// GetDescription returns the Description field value if set, zero value otherwise.
func (o *ForbiddenKeyError) GetDescription() string {
	if o == nil || o.Description == nil {
		var ret string
		return ret
	}
	return *o.Description
}

// GetDescriptionOk returns a tuple with the Description field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ForbiddenKeyError) GetDescriptionOk() (*string, bool) {
	if o == nil || o.Description == nil {
		return nil, false
	}
	return o.Description, true
}

// HasDescription returns a boolean if a field has been set.
func (o *ForbiddenKeyError) HasDescription() bool {
	if o != nil && o.Description != nil {
		return true
	}

	return false
}

// SetDescription gets a reference to the given string and assigns it to the Description field.
func (o *ForbiddenKeyError) SetDescription(v string) {
	o.Description = &v
}

func (o ForbiddenKeyError) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Code != nil {
		toSerialize["code"] = o.Code
	}
	if o.Description != nil {
		toSerialize["description"] = o.Description
	}
	return json.Marshal(toSerialize)
}

type NullableForbiddenKeyError struct {
	value *ForbiddenKeyError
	isSet bool
}

func (v NullableForbiddenKeyError) Get() *ForbiddenKeyError {
	return v.value
}

func (v *NullableForbiddenKeyError) Set(val *ForbiddenKeyError) {
	v.value = val
	v.isSet = true
}

func (v NullableForbiddenKeyError) IsSet() bool {
	return v.isSet
}

func (v *NullableForbiddenKeyError) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableForbiddenKeyError(val *ForbiddenKeyError) *NullableForbiddenKeyError {
	return &NullableForbiddenKeyError{value: val, isSet: true}
}

func (v NullableForbiddenKeyError) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableForbiddenKeyError) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


