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

// InvaildRequestSubtype struct for InvaildRequestSubtype
type InvaildRequestSubtype struct {
	Errors *InvaildRequestSubtypeErrors `json:"errors,omitempty"`
	Code *int32 `json:"code,omitempty"`
	Description *string `json:"description,omitempty"`
}

// NewInvaildRequestSubtype instantiates a new InvaildRequestSubtype object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewInvaildRequestSubtype() *InvaildRequestSubtype {
	this := InvaildRequestSubtype{}
	return &this
}

// NewInvaildRequestSubtypeWithDefaults instantiates a new InvaildRequestSubtype object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewInvaildRequestSubtypeWithDefaults() *InvaildRequestSubtype {
	this := InvaildRequestSubtype{}
	return &this
}

// GetErrors returns the Errors field value if set, zero value otherwise.
func (o *InvaildRequestSubtype) GetErrors() InvaildRequestSubtypeErrors {
	if o == nil || o.Errors == nil {
		var ret InvaildRequestSubtypeErrors
		return ret
	}
	return *o.Errors
}

// GetErrorsOk returns a tuple with the Errors field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *InvaildRequestSubtype) GetErrorsOk() (*InvaildRequestSubtypeErrors, bool) {
	if o == nil || o.Errors == nil {
		return nil, false
	}
	return o.Errors, true
}

// HasErrors returns a boolean if a field has been set.
func (o *InvaildRequestSubtype) HasErrors() bool {
	if o != nil && o.Errors != nil {
		return true
	}

	return false
}

// SetErrors gets a reference to the given InvaildRequestSubtypeErrors and assigns it to the Errors field.
func (o *InvaildRequestSubtype) SetErrors(v InvaildRequestSubtypeErrors) {
	o.Errors = &v
}

// GetCode returns the Code field value if set, zero value otherwise.
func (o *InvaildRequestSubtype) GetCode() int32 {
	if o == nil || o.Code == nil {
		var ret int32
		return ret
	}
	return *o.Code
}

// GetCodeOk returns a tuple with the Code field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *InvaildRequestSubtype) GetCodeOk() (*int32, bool) {
	if o == nil || o.Code == nil {
		return nil, false
	}
	return o.Code, true
}

// HasCode returns a boolean if a field has been set.
func (o *InvaildRequestSubtype) HasCode() bool {
	if o != nil && o.Code != nil {
		return true
	}

	return false
}

// SetCode gets a reference to the given int32 and assigns it to the Code field.
func (o *InvaildRequestSubtype) SetCode(v int32) {
	o.Code = &v
}

// GetDescription returns the Description field value if set, zero value otherwise.
func (o *InvaildRequestSubtype) GetDescription() string {
	if o == nil || o.Description == nil {
		var ret string
		return ret
	}
	return *o.Description
}

// GetDescriptionOk returns a tuple with the Description field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *InvaildRequestSubtype) GetDescriptionOk() (*string, bool) {
	if o == nil || o.Description == nil {
		return nil, false
	}
	return o.Description, true
}

// HasDescription returns a boolean if a field has been set.
func (o *InvaildRequestSubtype) HasDescription() bool {
	if o != nil && o.Description != nil {
		return true
	}

	return false
}

// SetDescription gets a reference to the given string and assigns it to the Description field.
func (o *InvaildRequestSubtype) SetDescription(v string) {
	o.Description = &v
}

func (o InvaildRequestSubtype) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Errors != nil {
		toSerialize["errors"] = o.Errors
	}
	if o.Code != nil {
		toSerialize["code"] = o.Code
	}
	if o.Description != nil {
		toSerialize["description"] = o.Description
	}
	return json.Marshal(toSerialize)
}

type NullableInvaildRequestSubtype struct {
	value *InvaildRequestSubtype
	isSet bool
}

func (v NullableInvaildRequestSubtype) Get() *InvaildRequestSubtype {
	return v.value
}

func (v *NullableInvaildRequestSubtype) Set(val *InvaildRequestSubtype) {
	v.value = val
	v.isSet = true
}

func (v NullableInvaildRequestSubtype) IsSet() bool {
	return v.isSet
}

func (v *NullableInvaildRequestSubtype) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableInvaildRequestSubtype(val *InvaildRequestSubtype) *NullableInvaildRequestSubtype {
	return &NullableInvaildRequestSubtype{value: val, isSet: true}
}

func (v NullableInvaildRequestSubtype) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableInvaildRequestSubtype) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


