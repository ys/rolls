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

// DeleteAlbum400Response struct for DeleteAlbum400Response
type DeleteAlbum400Response struct {
	Errors *DeleteAlbum400ResponseErrors `json:"errors,omitempty"`
	Code *int32 `json:"code,omitempty"`
	Description *string `json:"description,omitempty"`
}

// NewDeleteAlbum400Response instantiates a new DeleteAlbum400Response object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewDeleteAlbum400Response() *DeleteAlbum400Response {
	this := DeleteAlbum400Response{}
	return &this
}

// NewDeleteAlbum400ResponseWithDefaults instantiates a new DeleteAlbum400Response object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewDeleteAlbum400ResponseWithDefaults() *DeleteAlbum400Response {
	this := DeleteAlbum400Response{}
	return &this
}

// GetErrors returns the Errors field value if set, zero value otherwise.
func (o *DeleteAlbum400Response) GetErrors() DeleteAlbum400ResponseErrors {
	if o == nil || o.Errors == nil {
		var ret DeleteAlbum400ResponseErrors
		return ret
	}
	return *o.Errors
}

// GetErrorsOk returns a tuple with the Errors field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *DeleteAlbum400Response) GetErrorsOk() (*DeleteAlbum400ResponseErrors, bool) {
	if o == nil || o.Errors == nil {
		return nil, false
	}
	return o.Errors, true
}

// HasErrors returns a boolean if a field has been set.
func (o *DeleteAlbum400Response) HasErrors() bool {
	if o != nil && o.Errors != nil {
		return true
	}

	return false
}

// SetErrors gets a reference to the given DeleteAlbum400ResponseErrors and assigns it to the Errors field.
func (o *DeleteAlbum400Response) SetErrors(v DeleteAlbum400ResponseErrors) {
	o.Errors = &v
}

// GetCode returns the Code field value if set, zero value otherwise.
func (o *DeleteAlbum400Response) GetCode() int32 {
	if o == nil || o.Code == nil {
		var ret int32
		return ret
	}
	return *o.Code
}

// GetCodeOk returns a tuple with the Code field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *DeleteAlbum400Response) GetCodeOk() (*int32, bool) {
	if o == nil || o.Code == nil {
		return nil, false
	}
	return o.Code, true
}

// HasCode returns a boolean if a field has been set.
func (o *DeleteAlbum400Response) HasCode() bool {
	if o != nil && o.Code != nil {
		return true
	}

	return false
}

// SetCode gets a reference to the given int32 and assigns it to the Code field.
func (o *DeleteAlbum400Response) SetCode(v int32) {
	o.Code = &v
}

// GetDescription returns the Description field value if set, zero value otherwise.
func (o *DeleteAlbum400Response) GetDescription() string {
	if o == nil || o.Description == nil {
		var ret string
		return ret
	}
	return *o.Description
}

// GetDescriptionOk returns a tuple with the Description field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *DeleteAlbum400Response) GetDescriptionOk() (*string, bool) {
	if o == nil || o.Description == nil {
		return nil, false
	}
	return o.Description, true
}

// HasDescription returns a boolean if a field has been set.
func (o *DeleteAlbum400Response) HasDescription() bool {
	if o != nil && o.Description != nil {
		return true
	}

	return false
}

// SetDescription gets a reference to the given string and assigns it to the Description field.
func (o *DeleteAlbum400Response) SetDescription(v string) {
	o.Description = &v
}

func (o DeleteAlbum400Response) MarshalJSON() ([]byte, error) {
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

type NullableDeleteAlbum400Response struct {
	value *DeleteAlbum400Response
	isSet bool
}

func (v NullableDeleteAlbum400Response) Get() *DeleteAlbum400Response {
	return v.value
}

func (v *NullableDeleteAlbum400Response) Set(val *DeleteAlbum400Response) {
	v.value = val
	v.isSet = true
}

func (v NullableDeleteAlbum400Response) IsSet() bool {
	return v.isSet
}

func (v *NullableDeleteAlbum400Response) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableDeleteAlbum400Response(val *DeleteAlbum400Response) *NullableDeleteAlbum400Response {
	return &NullableDeleteAlbum400Response{value: val, isSet: true}
}

func (v NullableDeleteAlbum400Response) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableDeleteAlbum400Response) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}

