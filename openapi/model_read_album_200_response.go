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

// ReadAlbum200Response struct for ReadAlbum200Response
type ReadAlbum200Response struct {
	// Base URL that can be prepended to the 'href' values in the 'links' to produce fully qualified URLs for future queries.
	Base *string `json:"base,omitempty"`
	Id *string `json:"id,omitempty"`
	Type *string `json:"type,omitempty"`
	Subtype *string `json:"subtype,omitempty"`
	// datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z.
	Created *string `json:"created,omitempty"`
	// datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z.
	Updated *string `json:"updated,omitempty"`
	Links map[string]interface{} `json:"links,omitempty"`
	Payload map[string]interface{} `json:"payload,omitempty"`
}

// NewReadAlbum200Response instantiates a new ReadAlbum200Response object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewReadAlbum200Response() *ReadAlbum200Response {
	this := ReadAlbum200Response{}
	return &this
}

// NewReadAlbum200ResponseWithDefaults instantiates a new ReadAlbum200Response object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewReadAlbum200ResponseWithDefaults() *ReadAlbum200Response {
	this := ReadAlbum200Response{}
	return &this
}

// GetBase returns the Base field value if set, zero value otherwise.
func (o *ReadAlbum200Response) GetBase() string {
	if o == nil || o.Base == nil {
		var ret string
		return ret
	}
	return *o.Base
}

// GetBaseOk returns a tuple with the Base field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ReadAlbum200Response) GetBaseOk() (*string, bool) {
	if o == nil || o.Base == nil {
		return nil, false
	}
	return o.Base, true
}

// HasBase returns a boolean if a field has been set.
func (o *ReadAlbum200Response) HasBase() bool {
	if o != nil && o.Base != nil {
		return true
	}

	return false
}

// SetBase gets a reference to the given string and assigns it to the Base field.
func (o *ReadAlbum200Response) SetBase(v string) {
	o.Base = &v
}

// GetId returns the Id field value if set, zero value otherwise.
func (o *ReadAlbum200Response) GetId() string {
	if o == nil || o.Id == nil {
		var ret string
		return ret
	}
	return *o.Id
}

// GetIdOk returns a tuple with the Id field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ReadAlbum200Response) GetIdOk() (*string, bool) {
	if o == nil || o.Id == nil {
		return nil, false
	}
	return o.Id, true
}

// HasId returns a boolean if a field has been set.
func (o *ReadAlbum200Response) HasId() bool {
	if o != nil && o.Id != nil {
		return true
	}

	return false
}

// SetId gets a reference to the given string and assigns it to the Id field.
func (o *ReadAlbum200Response) SetId(v string) {
	o.Id = &v
}

// GetType returns the Type field value if set, zero value otherwise.
func (o *ReadAlbum200Response) GetType() string {
	if o == nil || o.Type == nil {
		var ret string
		return ret
	}
	return *o.Type
}

// GetTypeOk returns a tuple with the Type field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ReadAlbum200Response) GetTypeOk() (*string, bool) {
	if o == nil || o.Type == nil {
		return nil, false
	}
	return o.Type, true
}

// HasType returns a boolean if a field has been set.
func (o *ReadAlbum200Response) HasType() bool {
	if o != nil && o.Type != nil {
		return true
	}

	return false
}

// SetType gets a reference to the given string and assigns it to the Type field.
func (o *ReadAlbum200Response) SetType(v string) {
	o.Type = &v
}

// GetSubtype returns the Subtype field value if set, zero value otherwise.
func (o *ReadAlbum200Response) GetSubtype() string {
	if o == nil || o.Subtype == nil {
		var ret string
		return ret
	}
	return *o.Subtype
}

// GetSubtypeOk returns a tuple with the Subtype field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ReadAlbum200Response) GetSubtypeOk() (*string, bool) {
	if o == nil || o.Subtype == nil {
		return nil, false
	}
	return o.Subtype, true
}

// HasSubtype returns a boolean if a field has been set.
func (o *ReadAlbum200Response) HasSubtype() bool {
	if o != nil && o.Subtype != nil {
		return true
	}

	return false
}

// SetSubtype gets a reference to the given string and assigns it to the Subtype field.
func (o *ReadAlbum200Response) SetSubtype(v string) {
	o.Subtype = &v
}

// GetCreated returns the Created field value if set, zero value otherwise.
func (o *ReadAlbum200Response) GetCreated() string {
	if o == nil || o.Created == nil {
		var ret string
		return ret
	}
	return *o.Created
}

// GetCreatedOk returns a tuple with the Created field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ReadAlbum200Response) GetCreatedOk() (*string, bool) {
	if o == nil || o.Created == nil {
		return nil, false
	}
	return o.Created, true
}

// HasCreated returns a boolean if a field has been set.
func (o *ReadAlbum200Response) HasCreated() bool {
	if o != nil && o.Created != nil {
		return true
	}

	return false
}

// SetCreated gets a reference to the given string and assigns it to the Created field.
func (o *ReadAlbum200Response) SetCreated(v string) {
	o.Created = &v
}

// GetUpdated returns the Updated field value if set, zero value otherwise.
func (o *ReadAlbum200Response) GetUpdated() string {
	if o == nil || o.Updated == nil {
		var ret string
		return ret
	}
	return *o.Updated
}

// GetUpdatedOk returns a tuple with the Updated field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ReadAlbum200Response) GetUpdatedOk() (*string, bool) {
	if o == nil || o.Updated == nil {
		return nil, false
	}
	return o.Updated, true
}

// HasUpdated returns a boolean if a field has been set.
func (o *ReadAlbum200Response) HasUpdated() bool {
	if o != nil && o.Updated != nil {
		return true
	}

	return false
}

// SetUpdated gets a reference to the given string and assigns it to the Updated field.
func (o *ReadAlbum200Response) SetUpdated(v string) {
	o.Updated = &v
}

// GetLinks returns the Links field value if set, zero value otherwise.
func (o *ReadAlbum200Response) GetLinks() map[string]interface{} {
	if o == nil || o.Links == nil {
		var ret map[string]interface{}
		return ret
	}
	return o.Links
}

// GetLinksOk returns a tuple with the Links field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ReadAlbum200Response) GetLinksOk() (map[string]interface{}, bool) {
	if o == nil || o.Links == nil {
		return nil, false
	}
	return o.Links, true
}

// HasLinks returns a boolean if a field has been set.
func (o *ReadAlbum200Response) HasLinks() bool {
	if o != nil && o.Links != nil {
		return true
	}

	return false
}

// SetLinks gets a reference to the given map[string]interface{} and assigns it to the Links field.
func (o *ReadAlbum200Response) SetLinks(v map[string]interface{}) {
	o.Links = v
}

// GetPayload returns the Payload field value if set, zero value otherwise.
func (o *ReadAlbum200Response) GetPayload() map[string]interface{} {
	if o == nil || o.Payload == nil {
		var ret map[string]interface{}
		return ret
	}
	return o.Payload
}

// GetPayloadOk returns a tuple with the Payload field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ReadAlbum200Response) GetPayloadOk() (map[string]interface{}, bool) {
	if o == nil || o.Payload == nil {
		return nil, false
	}
	return o.Payload, true
}

// HasPayload returns a boolean if a field has been set.
func (o *ReadAlbum200Response) HasPayload() bool {
	if o != nil && o.Payload != nil {
		return true
	}

	return false
}

// SetPayload gets a reference to the given map[string]interface{} and assigns it to the Payload field.
func (o *ReadAlbum200Response) SetPayload(v map[string]interface{}) {
	o.Payload = v
}

func (o ReadAlbum200Response) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Base != nil {
		toSerialize["base"] = o.Base
	}
	if o.Id != nil {
		toSerialize["id"] = o.Id
	}
	if o.Type != nil {
		toSerialize["type"] = o.Type
	}
	if o.Subtype != nil {
		toSerialize["subtype"] = o.Subtype
	}
	if o.Created != nil {
		toSerialize["created"] = o.Created
	}
	if o.Updated != nil {
		toSerialize["updated"] = o.Updated
	}
	if o.Links != nil {
		toSerialize["links"] = o.Links
	}
	if o.Payload != nil {
		toSerialize["payload"] = o.Payload
	}
	return json.Marshal(toSerialize)
}

type NullableReadAlbum200Response struct {
	value *ReadAlbum200Response
	isSet bool
}

func (v NullableReadAlbum200Response) Get() *ReadAlbum200Response {
	return v.value
}

func (v *NullableReadAlbum200Response) Set(val *ReadAlbum200Response) {
	v.value = val
	v.isSet = true
}

func (v NullableReadAlbum200Response) IsSet() bool {
	return v.isSet
}

func (v *NullableReadAlbum200Response) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableReadAlbum200Response(val *ReadAlbum200Response) *NullableReadAlbum200Response {
	return &NullableReadAlbum200Response{value: val, isSet: true}
}

func (v NullableReadAlbum200Response) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableReadAlbum200Response) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


