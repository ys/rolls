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

// GetAlbums200ResponseResourcesInner struct for GetAlbums200ResponseResourcesInner
type GetAlbums200ResponseResourcesInner struct {
	Id *string `json:"id,omitempty"`
	// datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z.
	Created *string `json:"created,omitempty"`
	// datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z.
	Updated *string `json:"updated,omitempty"`
	Type *string `json:"type,omitempty"`
	Subtype *string `json:"subtype,omitempty"`
	// The API Key (client identifier) of the service affiliated with the album.
	ServiceId *string `json:"serviceId,omitempty"`
	Payload *AlbumPayload `json:"payload,omitempty"`
	Links map[string]interface{} `json:"links,omitempty"`
}

// NewGetAlbums200ResponseResourcesInner instantiates a new GetAlbums200ResponseResourcesInner object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewGetAlbums200ResponseResourcesInner() *GetAlbums200ResponseResourcesInner {
	this := GetAlbums200ResponseResourcesInner{}
	return &this
}

// NewGetAlbums200ResponseResourcesInnerWithDefaults instantiates a new GetAlbums200ResponseResourcesInner object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewGetAlbums200ResponseResourcesInnerWithDefaults() *GetAlbums200ResponseResourcesInner {
	this := GetAlbums200ResponseResourcesInner{}
	return &this
}

// GetId returns the Id field value if set, zero value otherwise.
func (o *GetAlbums200ResponseResourcesInner) GetId() string {
	if o == nil || o.Id == nil {
		var ret string
		return ret
	}
	return *o.Id
}

// GetIdOk returns a tuple with the Id field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAlbums200ResponseResourcesInner) GetIdOk() (*string, bool) {
	if o == nil || o.Id == nil {
		return nil, false
	}
	return o.Id, true
}

// HasId returns a boolean if a field has been set.
func (o *GetAlbums200ResponseResourcesInner) HasId() bool {
	if o != nil && o.Id != nil {
		return true
	}

	return false
}

// SetId gets a reference to the given string and assigns it to the Id field.
func (o *GetAlbums200ResponseResourcesInner) SetId(v string) {
	o.Id = &v
}

// GetCreated returns the Created field value if set, zero value otherwise.
func (o *GetAlbums200ResponseResourcesInner) GetCreated() string {
	if o == nil || o.Created == nil {
		var ret string
		return ret
	}
	return *o.Created
}

// GetCreatedOk returns a tuple with the Created field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAlbums200ResponseResourcesInner) GetCreatedOk() (*string, bool) {
	if o == nil || o.Created == nil {
		return nil, false
	}
	return o.Created, true
}

// HasCreated returns a boolean if a field has been set.
func (o *GetAlbums200ResponseResourcesInner) HasCreated() bool {
	if o != nil && o.Created != nil {
		return true
	}

	return false
}

// SetCreated gets a reference to the given string and assigns it to the Created field.
func (o *GetAlbums200ResponseResourcesInner) SetCreated(v string) {
	o.Created = &v
}

// GetUpdated returns the Updated field value if set, zero value otherwise.
func (o *GetAlbums200ResponseResourcesInner) GetUpdated() string {
	if o == nil || o.Updated == nil {
		var ret string
		return ret
	}
	return *o.Updated
}

// GetUpdatedOk returns a tuple with the Updated field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAlbums200ResponseResourcesInner) GetUpdatedOk() (*string, bool) {
	if o == nil || o.Updated == nil {
		return nil, false
	}
	return o.Updated, true
}

// HasUpdated returns a boolean if a field has been set.
func (o *GetAlbums200ResponseResourcesInner) HasUpdated() bool {
	if o != nil && o.Updated != nil {
		return true
	}

	return false
}

// SetUpdated gets a reference to the given string and assigns it to the Updated field.
func (o *GetAlbums200ResponseResourcesInner) SetUpdated(v string) {
	o.Updated = &v
}

// GetType returns the Type field value if set, zero value otherwise.
func (o *GetAlbums200ResponseResourcesInner) GetType() string {
	if o == nil || o.Type == nil {
		var ret string
		return ret
	}
	return *o.Type
}

// GetTypeOk returns a tuple with the Type field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAlbums200ResponseResourcesInner) GetTypeOk() (*string, bool) {
	if o == nil || o.Type == nil {
		return nil, false
	}
	return o.Type, true
}

// HasType returns a boolean if a field has been set.
func (o *GetAlbums200ResponseResourcesInner) HasType() bool {
	if o != nil && o.Type != nil {
		return true
	}

	return false
}

// SetType gets a reference to the given string and assigns it to the Type field.
func (o *GetAlbums200ResponseResourcesInner) SetType(v string) {
	o.Type = &v
}

// GetSubtype returns the Subtype field value if set, zero value otherwise.
func (o *GetAlbums200ResponseResourcesInner) GetSubtype() string {
	if o == nil || o.Subtype == nil {
		var ret string
		return ret
	}
	return *o.Subtype
}

// GetSubtypeOk returns a tuple with the Subtype field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAlbums200ResponseResourcesInner) GetSubtypeOk() (*string, bool) {
	if o == nil || o.Subtype == nil {
		return nil, false
	}
	return o.Subtype, true
}

// HasSubtype returns a boolean if a field has been set.
func (o *GetAlbums200ResponseResourcesInner) HasSubtype() bool {
	if o != nil && o.Subtype != nil {
		return true
	}

	return false
}

// SetSubtype gets a reference to the given string and assigns it to the Subtype field.
func (o *GetAlbums200ResponseResourcesInner) SetSubtype(v string) {
	o.Subtype = &v
}

// GetServiceId returns the ServiceId field value if set, zero value otherwise.
func (o *GetAlbums200ResponseResourcesInner) GetServiceId() string {
	if o == nil || o.ServiceId == nil {
		var ret string
		return ret
	}
	return *o.ServiceId
}

// GetServiceIdOk returns a tuple with the ServiceId field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAlbums200ResponseResourcesInner) GetServiceIdOk() (*string, bool) {
	if o == nil || o.ServiceId == nil {
		return nil, false
	}
	return o.ServiceId, true
}

// HasServiceId returns a boolean if a field has been set.
func (o *GetAlbums200ResponseResourcesInner) HasServiceId() bool {
	if o != nil && o.ServiceId != nil {
		return true
	}

	return false
}

// SetServiceId gets a reference to the given string and assigns it to the ServiceId field.
func (o *GetAlbums200ResponseResourcesInner) SetServiceId(v string) {
	o.ServiceId = &v
}

// GetPayload returns the Payload field value if set, zero value otherwise.
func (o *GetAlbums200ResponseResourcesInner) GetPayload() AlbumPayload {
	if o == nil || o.Payload == nil {
		var ret AlbumPayload
		return ret
	}
	return *o.Payload
}

// GetPayloadOk returns a tuple with the Payload field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAlbums200ResponseResourcesInner) GetPayloadOk() (*AlbumPayload, bool) {
	if o == nil || o.Payload == nil {
		return nil, false
	}
	return o.Payload, true
}

// HasPayload returns a boolean if a field has been set.
func (o *GetAlbums200ResponseResourcesInner) HasPayload() bool {
	if o != nil && o.Payload != nil {
		return true
	}

	return false
}

// SetPayload gets a reference to the given AlbumPayload and assigns it to the Payload field.
func (o *GetAlbums200ResponseResourcesInner) SetPayload(v AlbumPayload) {
	o.Payload = &v
}

// GetLinks returns the Links field value if set, zero value otherwise.
func (o *GetAlbums200ResponseResourcesInner) GetLinks() map[string]interface{} {
	if o == nil || o.Links == nil {
		var ret map[string]interface{}
		return ret
	}
	return o.Links
}

// GetLinksOk returns a tuple with the Links field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *GetAlbums200ResponseResourcesInner) GetLinksOk() (map[string]interface{}, bool) {
	if o == nil || o.Links == nil {
		return nil, false
	}
	return o.Links, true
}

// HasLinks returns a boolean if a field has been set.
func (o *GetAlbums200ResponseResourcesInner) HasLinks() bool {
	if o != nil && o.Links != nil {
		return true
	}

	return false
}

// SetLinks gets a reference to the given map[string]interface{} and assigns it to the Links field.
func (o *GetAlbums200ResponseResourcesInner) SetLinks(v map[string]interface{}) {
	o.Links = v
}

func (o GetAlbums200ResponseResourcesInner) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Id != nil {
		toSerialize["id"] = o.Id
	}
	if o.Created != nil {
		toSerialize["created"] = o.Created
	}
	if o.Updated != nil {
		toSerialize["updated"] = o.Updated
	}
	if o.Type != nil {
		toSerialize["type"] = o.Type
	}
	if o.Subtype != nil {
		toSerialize["subtype"] = o.Subtype
	}
	if o.ServiceId != nil {
		toSerialize["serviceId"] = o.ServiceId
	}
	if o.Payload != nil {
		toSerialize["payload"] = o.Payload
	}
	if o.Links != nil {
		toSerialize["links"] = o.Links
	}
	return json.Marshal(toSerialize)
}

type NullableGetAlbums200ResponseResourcesInner struct {
	value *GetAlbums200ResponseResourcesInner
	isSet bool
}

func (v NullableGetAlbums200ResponseResourcesInner) Get() *GetAlbums200ResponseResourcesInner {
	return v.value
}

func (v *NullableGetAlbums200ResponseResourcesInner) Set(val *GetAlbums200ResponseResourcesInner) {
	v.value = val
	v.isSet = true
}

func (v NullableGetAlbums200ResponseResourcesInner) IsSet() bool {
	return v.isSet
}

func (v *NullableGetAlbums200ResponseResourcesInner) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableGetAlbums200ResponseResourcesInner(val *GetAlbums200ResponseResourcesInner) *NullableGetAlbums200ResponseResourcesInner {
	return &NullableGetAlbums200ResponseResourcesInner{value: val, isSet: true}
}

func (v NullableGetAlbums200ResponseResourcesInner) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableGetAlbums200ResponseResourcesInner) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}

