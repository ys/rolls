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

// InvaildRequestNameErrors struct for InvaildRequestNameErrors
type InvaildRequestNameErrors struct {
	Name []string `json:"name,omitempty"`
}

// NewInvaildRequestNameErrors instantiates a new InvaildRequestNameErrors object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewInvaildRequestNameErrors() *InvaildRequestNameErrors {
	this := InvaildRequestNameErrors{}
	return &this
}

// NewInvaildRequestNameErrorsWithDefaults instantiates a new InvaildRequestNameErrors object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewInvaildRequestNameErrorsWithDefaults() *InvaildRequestNameErrors {
	this := InvaildRequestNameErrors{}
	return &this
}

// GetName returns the Name field value if set, zero value otherwise.
func (o *InvaildRequestNameErrors) GetName() []string {
	if o == nil || o.Name == nil {
		var ret []string
		return ret
	}
	return o.Name
}

// GetNameOk returns a tuple with the Name field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *InvaildRequestNameErrors) GetNameOk() ([]string, bool) {
	if o == nil || o.Name == nil {
		return nil, false
	}
	return o.Name, true
}

// HasName returns a boolean if a field has been set.
func (o *InvaildRequestNameErrors) HasName() bool {
	if o != nil && o.Name != nil {
		return true
	}

	return false
}

// SetName gets a reference to the given []string and assigns it to the Name field.
func (o *InvaildRequestNameErrors) SetName(v []string) {
	o.Name = v
}

func (o InvaildRequestNameErrors) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Name != nil {
		toSerialize["name"] = o.Name
	}
	return json.Marshal(toSerialize)
}

type NullableInvaildRequestNameErrors struct {
	value *InvaildRequestNameErrors
	isSet bool
}

func (v NullableInvaildRequestNameErrors) Get() *InvaildRequestNameErrors {
	return v.value
}

func (v *NullableInvaildRequestNameErrors) Set(val *InvaildRequestNameErrors) {
	v.value = val
	v.isSet = true
}

func (v NullableInvaildRequestNameErrors) IsSet() bool {
	return v.isSet
}

func (v *NullableInvaildRequestNameErrors) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableInvaildRequestNameErrors(val *InvaildRequestNameErrors) *NullableInvaildRequestNameErrors {
	return &NullableInvaildRequestNameErrors{value: val, isSet: true}
}

func (v NullableInvaildRequestNameErrors) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableInvaildRequestNameErrors) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


