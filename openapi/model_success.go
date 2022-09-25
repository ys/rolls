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

// Success struct for Success
type Success struct {
	// Base URL that can be prepended to the 'href' values in the 'links' to produce fully qualified URLs for future queries.
	Base *string `json:"base,omitempty"`
	Resources []SuccessResourcesInner `json:"resources,omitempty"`
}

// NewSuccess instantiates a new Success object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewSuccess() *Success {
	this := Success{}
	return &this
}

// NewSuccessWithDefaults instantiates a new Success object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewSuccessWithDefaults() *Success {
	this := Success{}
	return &this
}

// GetBase returns the Base field value if set, zero value otherwise.
func (o *Success) GetBase() string {
	if o == nil || o.Base == nil {
		var ret string
		return ret
	}
	return *o.Base
}

// GetBaseOk returns a tuple with the Base field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *Success) GetBaseOk() (*string, bool) {
	if o == nil || o.Base == nil {
		return nil, false
	}
	return o.Base, true
}

// HasBase returns a boolean if a field has been set.
func (o *Success) HasBase() bool {
	if o != nil && o.Base != nil {
		return true
	}

	return false
}

// SetBase gets a reference to the given string and assigns it to the Base field.
func (o *Success) SetBase(v string) {
	o.Base = &v
}

// GetResources returns the Resources field value if set, zero value otherwise.
func (o *Success) GetResources() []SuccessResourcesInner {
	if o == nil || o.Resources == nil {
		var ret []SuccessResourcesInner
		return ret
	}
	return o.Resources
}

// GetResourcesOk returns a tuple with the Resources field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *Success) GetResourcesOk() ([]SuccessResourcesInner, bool) {
	if o == nil || o.Resources == nil {
		return nil, false
	}
	return o.Resources, true
}

// HasResources returns a boolean if a field has been set.
func (o *Success) HasResources() bool {
	if o != nil && o.Resources != nil {
		return true
	}

	return false
}

// SetResources gets a reference to the given []SuccessResourcesInner and assigns it to the Resources field.
func (o *Success) SetResources(v []SuccessResourcesInner) {
	o.Resources = v
}

func (o Success) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Base != nil {
		toSerialize["base"] = o.Base
	}
	if o.Resources != nil {
		toSerialize["resources"] = o.Resources
	}
	return json.Marshal(toSerialize)
}

type NullableSuccess struct {
	value *Success
	isSet bool
}

func (v NullableSuccess) Get() *Success {
	return v.value
}

func (v *NullableSuccess) Set(val *Success) {
	v.value = val
	v.isSet = true
}

func (v NullableSuccess) IsSet() bool {
	return v.isSet
}

func (v *NullableSuccess) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableSuccess(val *Success) *NullableSuccess {
	return &NullableSuccess{value: val, isSet: true}
}

func (v NullableSuccess) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableSuccess) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


