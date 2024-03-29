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

// AlbumPayloadPublishInfo struct for AlbumPayloadPublishInfo
type AlbumPayloadPublishInfo struct {
	// Album metadata, unique to the service, encapsulated as a single string with a maximum length of 1024 characters.
	ServicePayload *string `json:"servicePayload,omitempty"`
	// Identifier for the album that is unique to the publishing service.
	RemoteId *string `json:"remoteId,omitempty"`
	// datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z.
	Created *string `json:"created,omitempty"`
	// datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z.
	Updated *string `json:"updated,omitempty"`
	// True if the externally affiliated content (identified by remoteId) was deleted; acts as a tombstone.
	Deleted *bool `json:"deleted,omitempty"`
	RemoteLinks *AlbumPayloadPublishInfoRemoteLinks `json:"remoteLinks,omitempty"`
}

// NewAlbumPayloadPublishInfo instantiates a new AlbumPayloadPublishInfo object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewAlbumPayloadPublishInfo() *AlbumPayloadPublishInfo {
	this := AlbumPayloadPublishInfo{}
	return &this
}

// NewAlbumPayloadPublishInfoWithDefaults instantiates a new AlbumPayloadPublishInfo object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewAlbumPayloadPublishInfoWithDefaults() *AlbumPayloadPublishInfo {
	this := AlbumPayloadPublishInfo{}
	return &this
}

// GetServicePayload returns the ServicePayload field value if set, zero value otherwise.
func (o *AlbumPayloadPublishInfo) GetServicePayload() string {
	if o == nil || o.ServicePayload == nil {
		var ret string
		return ret
	}
	return *o.ServicePayload
}

// GetServicePayloadOk returns a tuple with the ServicePayload field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AlbumPayloadPublishInfo) GetServicePayloadOk() (*string, bool) {
	if o == nil || o.ServicePayload == nil {
		return nil, false
	}
	return o.ServicePayload, true
}

// HasServicePayload returns a boolean if a field has been set.
func (o *AlbumPayloadPublishInfo) HasServicePayload() bool {
	if o != nil && o.ServicePayload != nil {
		return true
	}

	return false
}

// SetServicePayload gets a reference to the given string and assigns it to the ServicePayload field.
func (o *AlbumPayloadPublishInfo) SetServicePayload(v string) {
	o.ServicePayload = &v
}

// GetRemoteId returns the RemoteId field value if set, zero value otherwise.
func (o *AlbumPayloadPublishInfo) GetRemoteId() string {
	if o == nil || o.RemoteId == nil {
		var ret string
		return ret
	}
	return *o.RemoteId
}

// GetRemoteIdOk returns a tuple with the RemoteId field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AlbumPayloadPublishInfo) GetRemoteIdOk() (*string, bool) {
	if o == nil || o.RemoteId == nil {
		return nil, false
	}
	return o.RemoteId, true
}

// HasRemoteId returns a boolean if a field has been set.
func (o *AlbumPayloadPublishInfo) HasRemoteId() bool {
	if o != nil && o.RemoteId != nil {
		return true
	}

	return false
}

// SetRemoteId gets a reference to the given string and assigns it to the RemoteId field.
func (o *AlbumPayloadPublishInfo) SetRemoteId(v string) {
	o.RemoteId = &v
}

// GetCreated returns the Created field value if set, zero value otherwise.
func (o *AlbumPayloadPublishInfo) GetCreated() string {
	if o == nil || o.Created == nil {
		var ret string
		return ret
	}
	return *o.Created
}

// GetCreatedOk returns a tuple with the Created field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AlbumPayloadPublishInfo) GetCreatedOk() (*string, bool) {
	if o == nil || o.Created == nil {
		return nil, false
	}
	return o.Created, true
}

// HasCreated returns a boolean if a field has been set.
func (o *AlbumPayloadPublishInfo) HasCreated() bool {
	if o != nil && o.Created != nil {
		return true
	}

	return false
}

// SetCreated gets a reference to the given string and assigns it to the Created field.
func (o *AlbumPayloadPublishInfo) SetCreated(v string) {
	o.Created = &v
}

// GetUpdated returns the Updated field value if set, zero value otherwise.
func (o *AlbumPayloadPublishInfo) GetUpdated() string {
	if o == nil || o.Updated == nil {
		var ret string
		return ret
	}
	return *o.Updated
}

// GetUpdatedOk returns a tuple with the Updated field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AlbumPayloadPublishInfo) GetUpdatedOk() (*string, bool) {
	if o == nil || o.Updated == nil {
		return nil, false
	}
	return o.Updated, true
}

// HasUpdated returns a boolean if a field has been set.
func (o *AlbumPayloadPublishInfo) HasUpdated() bool {
	if o != nil && o.Updated != nil {
		return true
	}

	return false
}

// SetUpdated gets a reference to the given string and assigns it to the Updated field.
func (o *AlbumPayloadPublishInfo) SetUpdated(v string) {
	o.Updated = &v
}

// GetDeleted returns the Deleted field value if set, zero value otherwise.
func (o *AlbumPayloadPublishInfo) GetDeleted() bool {
	if o == nil || o.Deleted == nil {
		var ret bool
		return ret
	}
	return *o.Deleted
}

// GetDeletedOk returns a tuple with the Deleted field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AlbumPayloadPublishInfo) GetDeletedOk() (*bool, bool) {
	if o == nil || o.Deleted == nil {
		return nil, false
	}
	return o.Deleted, true
}

// HasDeleted returns a boolean if a field has been set.
func (o *AlbumPayloadPublishInfo) HasDeleted() bool {
	if o != nil && o.Deleted != nil {
		return true
	}

	return false
}

// SetDeleted gets a reference to the given bool and assigns it to the Deleted field.
func (o *AlbumPayloadPublishInfo) SetDeleted(v bool) {
	o.Deleted = &v
}

// GetRemoteLinks returns the RemoteLinks field value if set, zero value otherwise.
func (o *AlbumPayloadPublishInfo) GetRemoteLinks() AlbumPayloadPublishInfoRemoteLinks {
	if o == nil || o.RemoteLinks == nil {
		var ret AlbumPayloadPublishInfoRemoteLinks
		return ret
	}
	return *o.RemoteLinks
}

// GetRemoteLinksOk returns a tuple with the RemoteLinks field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AlbumPayloadPublishInfo) GetRemoteLinksOk() (*AlbumPayloadPublishInfoRemoteLinks, bool) {
	if o == nil || o.RemoteLinks == nil {
		return nil, false
	}
	return o.RemoteLinks, true
}

// HasRemoteLinks returns a boolean if a field has been set.
func (o *AlbumPayloadPublishInfo) HasRemoteLinks() bool {
	if o != nil && o.RemoteLinks != nil {
		return true
	}

	return false
}

// SetRemoteLinks gets a reference to the given AlbumPayloadPublishInfoRemoteLinks and assigns it to the RemoteLinks field.
func (o *AlbumPayloadPublishInfo) SetRemoteLinks(v AlbumPayloadPublishInfoRemoteLinks) {
	o.RemoteLinks = &v
}

func (o AlbumPayloadPublishInfo) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.ServicePayload != nil {
		toSerialize["servicePayload"] = o.ServicePayload
	}
	if o.RemoteId != nil {
		toSerialize["remoteId"] = o.RemoteId
	}
	if o.Created != nil {
		toSerialize["created"] = o.Created
	}
	if o.Updated != nil {
		toSerialize["updated"] = o.Updated
	}
	if o.Deleted != nil {
		toSerialize["deleted"] = o.Deleted
	}
	if o.RemoteLinks != nil {
		toSerialize["remoteLinks"] = o.RemoteLinks
	}
	return json.Marshal(toSerialize)
}

type NullableAlbumPayloadPublishInfo struct {
	value *AlbumPayloadPublishInfo
	isSet bool
}

func (v NullableAlbumPayloadPublishInfo) Get() *AlbumPayloadPublishInfo {
	return v.value
}

func (v *NullableAlbumPayloadPublishInfo) Set(val *AlbumPayloadPublishInfo) {
	v.value = val
	v.isSet = true
}

func (v NullableAlbumPayloadPublishInfo) IsSet() bool {
	return v.isSet
}

func (v *NullableAlbumPayloadPublishInfo) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableAlbumPayloadPublishInfo(val *AlbumPayloadPublishInfo) *NullableAlbumPayloadPublishInfo {
	return &NullableAlbumPayloadPublishInfo{value: val, isSet: true}
}

func (v NullableAlbumPayloadPublishInfo) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableAlbumPayloadPublishInfo) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


