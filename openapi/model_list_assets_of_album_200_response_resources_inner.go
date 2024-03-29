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

// ListAssetsOfAlbum200ResponseResourcesInner struct for ListAssetsOfAlbum200ResponseResourcesInner
type ListAssetsOfAlbum200ResponseResourcesInner struct {
	Id *string `json:"id,omitempty"`
	Type *string `json:"type,omitempty"`
	// datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z.
	Created *string `json:"created,omitempty"`
	// datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z.
	Updated *string `json:"updated,omitempty"`
	Links map[string]interface{} `json:"links,omitempty"`
	Asset *ListAssetsOfAlbum200ResponseResourcesInnerAsset `json:"asset,omitempty"`
}

// NewListAssetsOfAlbum200ResponseResourcesInner instantiates a new ListAssetsOfAlbum200ResponseResourcesInner object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewListAssetsOfAlbum200ResponseResourcesInner() *ListAssetsOfAlbum200ResponseResourcesInner {
	this := ListAssetsOfAlbum200ResponseResourcesInner{}
	return &this
}

// NewListAssetsOfAlbum200ResponseResourcesInnerWithDefaults instantiates a new ListAssetsOfAlbum200ResponseResourcesInner object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewListAssetsOfAlbum200ResponseResourcesInnerWithDefaults() *ListAssetsOfAlbum200ResponseResourcesInner {
	this := ListAssetsOfAlbum200ResponseResourcesInner{}
	return &this
}

// GetId returns the Id field value if set, zero value otherwise.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetId() string {
	if o == nil || o.Id == nil {
		var ret string
		return ret
	}
	return *o.Id
}

// GetIdOk returns a tuple with the Id field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetIdOk() (*string, bool) {
	if o == nil || o.Id == nil {
		return nil, false
	}
	return o.Id, true
}

// HasId returns a boolean if a field has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasId() bool {
	if o != nil && o.Id != nil {
		return true
	}

	return false
}

// SetId gets a reference to the given string and assigns it to the Id field.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetId(v string) {
	o.Id = &v
}

// GetType returns the Type field value if set, zero value otherwise.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetType() string {
	if o == nil || o.Type == nil {
		var ret string
		return ret
	}
	return *o.Type
}

// GetTypeOk returns a tuple with the Type field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetTypeOk() (*string, bool) {
	if o == nil || o.Type == nil {
		return nil, false
	}
	return o.Type, true
}

// HasType returns a boolean if a field has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasType() bool {
	if o != nil && o.Type != nil {
		return true
	}

	return false
}

// SetType gets a reference to the given string and assigns it to the Type field.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetType(v string) {
	o.Type = &v
}

// GetCreated returns the Created field value if set, zero value otherwise.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetCreated() string {
	if o == nil || o.Created == nil {
		var ret string
		return ret
	}
	return *o.Created
}

// GetCreatedOk returns a tuple with the Created field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetCreatedOk() (*string, bool) {
	if o == nil || o.Created == nil {
		return nil, false
	}
	return o.Created, true
}

// HasCreated returns a boolean if a field has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasCreated() bool {
	if o != nil && o.Created != nil {
		return true
	}

	return false
}

// SetCreated gets a reference to the given string and assigns it to the Created field.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetCreated(v string) {
	o.Created = &v
}

// GetUpdated returns the Updated field value if set, zero value otherwise.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetUpdated() string {
	if o == nil || o.Updated == nil {
		var ret string
		return ret
	}
	return *o.Updated
}

// GetUpdatedOk returns a tuple with the Updated field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetUpdatedOk() (*string, bool) {
	if o == nil || o.Updated == nil {
		return nil, false
	}
	return o.Updated, true
}

// HasUpdated returns a boolean if a field has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasUpdated() bool {
	if o != nil && o.Updated != nil {
		return true
	}

	return false
}

// SetUpdated gets a reference to the given string and assigns it to the Updated field.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetUpdated(v string) {
	o.Updated = &v
}

// GetLinks returns the Links field value if set, zero value otherwise.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetLinks() map[string]interface{} {
	if o == nil || o.Links == nil {
		var ret map[string]interface{}
		return ret
	}
	return o.Links
}

// GetLinksOk returns a tuple with the Links field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetLinksOk() (map[string]interface{}, bool) {
	if o == nil || o.Links == nil {
		return nil, false
	}
	return o.Links, true
}

// HasLinks returns a boolean if a field has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasLinks() bool {
	if o != nil && o.Links != nil {
		return true
	}

	return false
}

// SetLinks gets a reference to the given map[string]interface{} and assigns it to the Links field.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetLinks(v map[string]interface{}) {
	o.Links = v
}

// GetAsset returns the Asset field value if set, zero value otherwise.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetAsset() ListAssetsOfAlbum200ResponseResourcesInnerAsset {
	if o == nil || o.Asset == nil {
		var ret ListAssetsOfAlbum200ResponseResourcesInnerAsset
		return ret
	}
	return *o.Asset
}

// GetAssetOk returns a tuple with the Asset field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) GetAssetOk() (*ListAssetsOfAlbum200ResponseResourcesInnerAsset, bool) {
	if o == nil || o.Asset == nil {
		return nil, false
	}
	return o.Asset, true
}

// HasAsset returns a boolean if a field has been set.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) HasAsset() bool {
	if o != nil && o.Asset != nil {
		return true
	}

	return false
}

// SetAsset gets a reference to the given ListAssetsOfAlbum200ResponseResourcesInnerAsset and assigns it to the Asset field.
func (o *ListAssetsOfAlbum200ResponseResourcesInner) SetAsset(v ListAssetsOfAlbum200ResponseResourcesInnerAsset) {
	o.Asset = &v
}

func (o ListAssetsOfAlbum200ResponseResourcesInner) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Id != nil {
		toSerialize["id"] = o.Id
	}
	if o.Type != nil {
		toSerialize["type"] = o.Type
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
	if o.Asset != nil {
		toSerialize["asset"] = o.Asset
	}
	return json.Marshal(toSerialize)
}

type NullableListAssetsOfAlbum200ResponseResourcesInner struct {
	value *ListAssetsOfAlbum200ResponseResourcesInner
	isSet bool
}

func (v NullableListAssetsOfAlbum200ResponseResourcesInner) Get() *ListAssetsOfAlbum200ResponseResourcesInner {
	return v.value
}

func (v *NullableListAssetsOfAlbum200ResponseResourcesInner) Set(val *ListAssetsOfAlbum200ResponseResourcesInner) {
	v.value = val
	v.isSet = true
}

func (v NullableListAssetsOfAlbum200ResponseResourcesInner) IsSet() bool {
	return v.isSet
}

func (v *NullableListAssetsOfAlbum200ResponseResourcesInner) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableListAssetsOfAlbum200ResponseResourcesInner(val *ListAssetsOfAlbum200ResponseResourcesInner) *NullableListAssetsOfAlbum200ResponseResourcesInner {
	return &NullableListAssetsOfAlbum200ResponseResourcesInner{value: val, isSet: true}
}

func (v NullableListAssetsOfAlbum200ResponseResourcesInner) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableListAssetsOfAlbum200ResponseResourcesInner) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


