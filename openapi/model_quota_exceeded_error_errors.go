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

// QuotaExceededErrorErrors struct for QuotaExceededErrorErrors
type QuotaExceededErrorErrors struct {
	AssetId []string `json:"&lt;asset_id&gt;,omitempty"`
}

// NewQuotaExceededErrorErrors instantiates a new QuotaExceededErrorErrors object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewQuotaExceededErrorErrors() *QuotaExceededErrorErrors {
	this := QuotaExceededErrorErrors{}
	return &this
}

// NewQuotaExceededErrorErrorsWithDefaults instantiates a new QuotaExceededErrorErrors object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewQuotaExceededErrorErrorsWithDefaults() *QuotaExceededErrorErrors {
	this := QuotaExceededErrorErrors{}
	return &this
}

// GetAssetId returns the AssetId field value if set, zero value otherwise.
func (o *QuotaExceededErrorErrors) GetAssetId() []string {
	if o == nil || o.AssetId == nil {
		var ret []string
		return ret
	}
	return o.AssetId
}

// GetAssetIdOk returns a tuple with the AssetId field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *QuotaExceededErrorErrors) GetAssetIdOk() ([]string, bool) {
	if o == nil || o.AssetId == nil {
		return nil, false
	}
	return o.AssetId, true
}

// HasAssetId returns a boolean if a field has been set.
func (o *QuotaExceededErrorErrors) HasAssetId() bool {
	if o != nil && o.AssetId != nil {
		return true
	}

	return false
}

// SetAssetId gets a reference to the given []string and assigns it to the AssetId field.
func (o *QuotaExceededErrorErrors) SetAssetId(v []string) {
	o.AssetId = v
}

func (o QuotaExceededErrorErrors) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.AssetId != nil {
		toSerialize["&lt;asset_id&gt;"] = o.AssetId
	}
	return json.Marshal(toSerialize)
}

type NullableQuotaExceededErrorErrors struct {
	value *QuotaExceededErrorErrors
	isSet bool
}

func (v NullableQuotaExceededErrorErrors) Get() *QuotaExceededErrorErrors {
	return v.value
}

func (v *NullableQuotaExceededErrorErrors) Set(val *QuotaExceededErrorErrors) {
	v.value = val
	v.isSet = true
}

func (v NullableQuotaExceededErrorErrors) IsSet() bool {
	return v.isSet
}

func (v *NullableQuotaExceededErrorErrors) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableQuotaExceededErrorErrors(val *QuotaExceededErrorErrors) *NullableQuotaExceededErrorErrors {
	return &NullableQuotaExceededErrorErrors{value: val, isSet: true}
}

func (v NullableQuotaExceededErrorErrors) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableQuotaExceededErrorErrors) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


