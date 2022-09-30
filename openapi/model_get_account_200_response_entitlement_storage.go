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

// GetAccount200ResponseEntitlementStorage struct for GetAccount200ResponseEntitlementStorage
type GetAccount200ResponseEntitlementStorage struct {
	// The size in bytes of content this account that count against the storage limit.
	Used *int32 `json:"used,omitempty"`
	// Value of used at which the client applications should start warning the user. Absence indicates no warning should be given.
	Warn *int32 `json:"warn,omitempty"`
	// Specifies the storage limit in bytes that should be enforced for this account. It will always be greater than or equal to the display_limit.
	Limit *int32 `json:"limit,omitempty"`
	// Specifies the storage limit in bytes that is displayed to the user for this account.
	DisplayLimit *int32 `json:"display_limit,omitempty"`
}

// NewGetAccount200ResponseEntitlementStorage instantiates a new GetAccount200ResponseEntitlementStorage object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewGetAccount200ResponseEntitlementStorage() *GetAccount200ResponseEntitlementStorage {
	this := GetAccount200ResponseEntitlementStorage{}
	return &this
}

// NewGetAccount200ResponseEntitlementStorageWithDefaults instantiates a new GetAccount200ResponseEntitlementStorage object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewGetAccount200ResponseEntitlementStorageWithDefaults() *GetAccount200ResponseEntitlementStorage {
	this := GetAccount200ResponseEntitlementStorage{}
	return &this
}

// GetUsed returns the Used field value if set, zero value otherwise.
func (o *GetAccount200ResponseEntitlementStorage) GetUsed() int32 {
	if o == nil || o.Used == nil {
		var ret int32
		return ret
	}
	return *o.Used
}

// GetUsedOk returns a tuple with the Used field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAccount200ResponseEntitlementStorage) GetUsedOk() (*int32, bool) {
	if o == nil || o.Used == nil {
		return nil, false
	}
	return o.Used, true
}

// HasUsed returns a boolean if a field has been set.
func (o *GetAccount200ResponseEntitlementStorage) HasUsed() bool {
	if o != nil && o.Used != nil {
		return true
	}

	return false
}

// SetUsed gets a reference to the given int32 and assigns it to the Used field.
func (o *GetAccount200ResponseEntitlementStorage) SetUsed(v int32) {
	o.Used = &v
}

// GetWarn returns the Warn field value if set, zero value otherwise.
func (o *GetAccount200ResponseEntitlementStorage) GetWarn() int32 {
	if o == nil || o.Warn == nil {
		var ret int32
		return ret
	}
	return *o.Warn
}

// GetWarnOk returns a tuple with the Warn field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAccount200ResponseEntitlementStorage) GetWarnOk() (*int32, bool) {
	if o == nil || o.Warn == nil {
		return nil, false
	}
	return o.Warn, true
}

// HasWarn returns a boolean if a field has been set.
func (o *GetAccount200ResponseEntitlementStorage) HasWarn() bool {
	if o != nil && o.Warn != nil {
		return true
	}

	return false
}

// SetWarn gets a reference to the given int32 and assigns it to the Warn field.
func (o *GetAccount200ResponseEntitlementStorage) SetWarn(v int32) {
	o.Warn = &v
}

// GetLimit returns the Limit field value if set, zero value otherwise.
func (o *GetAccount200ResponseEntitlementStorage) GetLimit() int32 {
	if o == nil || o.Limit == nil {
		var ret int32
		return ret
	}
	return *o.Limit
}

// GetLimitOk returns a tuple with the Limit field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAccount200ResponseEntitlementStorage) GetLimitOk() (*int32, bool) {
	if o == nil || o.Limit == nil {
		return nil, false
	}
	return o.Limit, true
}

// HasLimit returns a boolean if a field has been set.
func (o *GetAccount200ResponseEntitlementStorage) HasLimit() bool {
	if o != nil && o.Limit != nil {
		return true
	}

	return false
}

// SetLimit gets a reference to the given int32 and assigns it to the Limit field.
func (o *GetAccount200ResponseEntitlementStorage) SetLimit(v int32) {
	o.Limit = &v
}

// GetDisplayLimit returns the DisplayLimit field value if set, zero value otherwise.
func (o *GetAccount200ResponseEntitlementStorage) GetDisplayLimit() int32 {
	if o == nil || o.DisplayLimit == nil {
		var ret int32
		return ret
	}
	return *o.DisplayLimit
}

// GetDisplayLimitOk returns a tuple with the DisplayLimit field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAccount200ResponseEntitlementStorage) GetDisplayLimitOk() (*int32, bool) {
	if o == nil || o.DisplayLimit == nil {
		return nil, false
	}
	return o.DisplayLimit, true
}

// HasDisplayLimit returns a boolean if a field has been set.
func (o *GetAccount200ResponseEntitlementStorage) HasDisplayLimit() bool {
	if o != nil && o.DisplayLimit != nil {
		return true
	}

	return false
}

// SetDisplayLimit gets a reference to the given int32 and assigns it to the DisplayLimit field.
func (o *GetAccount200ResponseEntitlementStorage) SetDisplayLimit(v int32) {
	o.DisplayLimit = &v
}

func (o GetAccount200ResponseEntitlementStorage) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Used != nil {
		toSerialize["used"] = o.Used
	}
	if o.Warn != nil {
		toSerialize["warn"] = o.Warn
	}
	if o.Limit != nil {
		toSerialize["limit"] = o.Limit
	}
	if o.DisplayLimit != nil {
		toSerialize["display_limit"] = o.DisplayLimit
	}
	return json.Marshal(toSerialize)
}

type NullableGetAccount200ResponseEntitlementStorage struct {
	value *GetAccount200ResponseEntitlementStorage
	isSet bool
}

func (v NullableGetAccount200ResponseEntitlementStorage) Get() *GetAccount200ResponseEntitlementStorage {
	return v.value
}

func (v *NullableGetAccount200ResponseEntitlementStorage) Set(val *GetAccount200ResponseEntitlementStorage) {
	v.value = val
	v.isSet = true
}

func (v NullableGetAccount200ResponseEntitlementStorage) IsSet() bool {
	return v.isSet
}

func (v *NullableGetAccount200ResponseEntitlementStorage) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableGetAccount200ResponseEntitlementStorage(val *GetAccount200ResponseEntitlementStorage) *NullableGetAccount200ResponseEntitlementStorage {
	return &NullableGetAccount200ResponseEntitlementStorage{value: val, isSet: true}
}

func (v NullableGetAccount200ResponseEntitlementStorage) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableGetAccount200ResponseEntitlementStorage) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}

