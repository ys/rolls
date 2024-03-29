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

// CreateAlbumRequest struct for CreateAlbumRequest
type CreateAlbumRequest struct {
	Subtype *string `json:"subtype,omitempty"`
	// The API Key (client identifier) of the service creating the album.
	ServiceId *string `json:"serviceId,omitempty"`
	Payload *AlbumPayload `json:"payload,omitempty"`
}

// NewCreateAlbumRequest instantiates a new CreateAlbumRequest object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewCreateAlbumRequest() *CreateAlbumRequest {
	this := CreateAlbumRequest{}
	return &this
}

// NewCreateAlbumRequestWithDefaults instantiates a new CreateAlbumRequest object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewCreateAlbumRequestWithDefaults() *CreateAlbumRequest {
	this := CreateAlbumRequest{}
	return &this
}

// GetSubtype returns the Subtype field value if set, zero value otherwise.
func (o *CreateAlbumRequest) GetSubtype() string {
	if o == nil || o.Subtype == nil {
		var ret string
		return ret
	}
	return *o.Subtype
}

// GetSubtypeOk returns a tuple with the Subtype field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CreateAlbumRequest) GetSubtypeOk() (*string, bool) {
	if o == nil || o.Subtype == nil {
		return nil, false
	}
	return o.Subtype, true
}

// HasSubtype returns a boolean if a field has been set.
func (o *CreateAlbumRequest) HasSubtype() bool {
	if o != nil && o.Subtype != nil {
		return true
	}

	return false
}

// SetSubtype gets a reference to the given string and assigns it to the Subtype field.
func (o *CreateAlbumRequest) SetSubtype(v string) {
	o.Subtype = &v
}

// GetServiceId returns the ServiceId field value if set, zero value otherwise.
func (o *CreateAlbumRequest) GetServiceId() string {
	if o == nil || o.ServiceId == nil {
		var ret string
		return ret
	}
	return *o.ServiceId
}

// GetServiceIdOk returns a tuple with the ServiceId field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CreateAlbumRequest) GetServiceIdOk() (*string, bool) {
	if o == nil || o.ServiceId == nil {
		return nil, false
	}
	return o.ServiceId, true
}

// HasServiceId returns a boolean if a field has been set.
func (o *CreateAlbumRequest) HasServiceId() bool {
	if o != nil && o.ServiceId != nil {
		return true
	}

	return false
}

// SetServiceId gets a reference to the given string and assigns it to the ServiceId field.
func (o *CreateAlbumRequest) SetServiceId(v string) {
	o.ServiceId = &v
}

// GetPayload returns the Payload field value if set, zero value otherwise.
func (o *CreateAlbumRequest) GetPayload() AlbumPayload {
	if o == nil || o.Payload == nil {
		var ret AlbumPayload
		return ret
	}
	return *o.Payload
}

// GetPayloadOk returns a tuple with the Payload field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CreateAlbumRequest) GetPayloadOk() (*AlbumPayload, bool) {
	if o == nil || o.Payload == nil {
		return nil, false
	}
	return o.Payload, true
}

// HasPayload returns a boolean if a field has been set.
func (o *CreateAlbumRequest) HasPayload() bool {
	if o != nil && o.Payload != nil {
		return true
	}

	return false
}

// SetPayload gets a reference to the given AlbumPayload and assigns it to the Payload field.
func (o *CreateAlbumRequest) SetPayload(v AlbumPayload) {
	o.Payload = &v
}

func (o CreateAlbumRequest) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Subtype != nil {
		toSerialize["subtype"] = o.Subtype
	}
	if o.ServiceId != nil {
		toSerialize["serviceId"] = o.ServiceId
	}
	if o.Payload != nil {
		toSerialize["payload"] = o.Payload
	}
	return json.Marshal(toSerialize)
}

type NullableCreateAlbumRequest struct {
	value *CreateAlbumRequest
	isSet bool
}

func (v NullableCreateAlbumRequest) Get() *CreateAlbumRequest {
	return v.value
}

func (v *NullableCreateAlbumRequest) Set(val *CreateAlbumRequest) {
	v.value = val
	v.isSet = true
}

func (v NullableCreateAlbumRequest) IsSet() bool {
	return v.isSet
}

func (v *NullableCreateAlbumRequest) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableCreateAlbumRequest(val *CreateAlbumRequest) *NullableCreateAlbumRequest {
	return &NullableCreateAlbumRequest{value: val, isSet: true}
}

func (v NullableCreateAlbumRequest) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableCreateAlbumRequest) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


