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

// InvaildRequestRenditionTypeErrors struct for InvaildRequestRenditionTypeErrors
type InvaildRequestRenditionTypeErrors struct {
	RenditionType []string `json:"rendition_type,omitempty"`
}

// NewInvaildRequestRenditionTypeErrors instantiates a new InvaildRequestRenditionTypeErrors object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewInvaildRequestRenditionTypeErrors() *InvaildRequestRenditionTypeErrors {
	this := InvaildRequestRenditionTypeErrors{}
	return &this
}

// NewInvaildRequestRenditionTypeErrorsWithDefaults instantiates a new InvaildRequestRenditionTypeErrors object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewInvaildRequestRenditionTypeErrorsWithDefaults() *InvaildRequestRenditionTypeErrors {
	this := InvaildRequestRenditionTypeErrors{}
	return &this
}

// GetRenditionType returns the RenditionType field value if set, zero value otherwise.
func (o *InvaildRequestRenditionTypeErrors) GetRenditionType() []string {
	if o == nil || o.RenditionType == nil {
		var ret []string
		return ret
	}
	return o.RenditionType
}

// GetRenditionTypeOk returns a tuple with the RenditionType field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *InvaildRequestRenditionTypeErrors) GetRenditionTypeOk() ([]string, bool) {
	if o == nil || o.RenditionType == nil {
		return nil, false
	}
	return o.RenditionType, true
}

// HasRenditionType returns a boolean if a field has been set.
func (o *InvaildRequestRenditionTypeErrors) HasRenditionType() bool {
	if o != nil && o.RenditionType != nil {
		return true
	}

	return false
}

// SetRenditionType gets a reference to the given []string and assigns it to the RenditionType field.
func (o *InvaildRequestRenditionTypeErrors) SetRenditionType(v []string) {
	o.RenditionType = v
}

func (o InvaildRequestRenditionTypeErrors) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.RenditionType != nil {
		toSerialize["rendition_type"] = o.RenditionType
	}
	return json.Marshal(toSerialize)
}

type NullableInvaildRequestRenditionTypeErrors struct {
	value *InvaildRequestRenditionTypeErrors
	isSet bool
}

func (v NullableInvaildRequestRenditionTypeErrors) Get() *InvaildRequestRenditionTypeErrors {
	return v.value
}

func (v *NullableInvaildRequestRenditionTypeErrors) Set(val *InvaildRequestRenditionTypeErrors) {
	v.value = val
	v.isSet = true
}

func (v NullableInvaildRequestRenditionTypeErrors) IsSet() bool {
	return v.isSet
}

func (v *NullableInvaildRequestRenditionTypeErrors) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableInvaildRequestRenditionTypeErrors(val *InvaildRequestRenditionTypeErrors) *NullableInvaildRequestRenditionTypeErrors {
	return &NullableInvaildRequestRenditionTypeErrors{value: val, isSet: true}
}

func (v NullableInvaildRequestRenditionTypeErrors) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableInvaildRequestRenditionTypeErrors) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


