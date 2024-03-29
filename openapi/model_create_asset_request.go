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

// CreateAssetRequest struct for CreateAssetRequest
type CreateAssetRequest struct {
	Subtype *string `json:"subtype,omitempty"`
	Payload *CreateAssetRequestPayload `json:"payload,omitempty"`
}

// NewCreateAssetRequest instantiates a new CreateAssetRequest object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewCreateAssetRequest() *CreateAssetRequest {
	this := CreateAssetRequest{}
	return &this
}

// NewCreateAssetRequestWithDefaults instantiates a new CreateAssetRequest object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewCreateAssetRequestWithDefaults() *CreateAssetRequest {
	this := CreateAssetRequest{}
	return &this
}

// GetSubtype returns the Subtype field value if set, zero value otherwise.
func (o *CreateAssetRequest) GetSubtype() string {
	if o == nil || o.Subtype == nil {
		var ret string
		return ret
	}
	return *o.Subtype
}

// GetSubtypeOk returns a tuple with the Subtype field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CreateAssetRequest) GetSubtypeOk() (*string, bool) {
	if o == nil || o.Subtype == nil {
		return nil, false
	}
	return o.Subtype, true
}

// HasSubtype returns a boolean if a field has been set.
func (o *CreateAssetRequest) HasSubtype() bool {
	if o != nil && o.Subtype != nil {
		return true
	}

	return false
}

// SetSubtype gets a reference to the given string and assigns it to the Subtype field.
func (o *CreateAssetRequest) SetSubtype(v string) {
	o.Subtype = &v
}

// GetPayload returns the Payload field value if set, zero value otherwise.
func (o *CreateAssetRequest) GetPayload() CreateAssetRequestPayload {
	if o == nil || o.Payload == nil {
		var ret CreateAssetRequestPayload
		return ret
	}
	return *o.Payload
}

// GetPayloadOk returns a tuple with the Payload field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CreateAssetRequest) GetPayloadOk() (*CreateAssetRequestPayload, bool) {
	if o == nil || o.Payload == nil {
		return nil, false
	}
	return o.Payload, true
}

// HasPayload returns a boolean if a field has been set.
func (o *CreateAssetRequest) HasPayload() bool {
	if o != nil && o.Payload != nil {
		return true
	}

	return false
}

// SetPayload gets a reference to the given CreateAssetRequestPayload and assigns it to the Payload field.
func (o *CreateAssetRequest) SetPayload(v CreateAssetRequestPayload) {
	o.Payload = &v
}

func (o CreateAssetRequest) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Subtype != nil {
		toSerialize["subtype"] = o.Subtype
	}
	if o.Payload != nil {
		toSerialize["payload"] = o.Payload
	}
	return json.Marshal(toSerialize)
}

type NullableCreateAssetRequest struct {
	value *CreateAssetRequest
	isSet bool
}

func (v NullableCreateAssetRequest) Get() *CreateAssetRequest {
	return v.value
}

func (v *NullableCreateAssetRequest) Set(val *CreateAssetRequest) {
	v.value = val
	v.isSet = true
}

func (v NullableCreateAssetRequest) IsSet() bool {
	return v.isSet
}

func (v *NullableCreateAssetRequest) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableCreateAssetRequest(val *CreateAssetRequest) *NullableCreateAssetRequest {
	return &NullableCreateAssetRequest{value: val, isSet: true}
}

func (v NullableCreateAssetRequest) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableCreateAssetRequest) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


