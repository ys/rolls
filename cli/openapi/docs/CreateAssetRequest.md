# CreateAssetRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Subtype** | Pointer to **string** |  | [optional] 
**Payload** | Pointer to [**CreateAssetRequestPayload**](CreateAssetRequestPayload.md) |  | [optional] 

## Methods

### NewCreateAssetRequest

`func NewCreateAssetRequest() *CreateAssetRequest`

NewCreateAssetRequest instantiates a new CreateAssetRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateAssetRequestWithDefaults

`func NewCreateAssetRequestWithDefaults() *CreateAssetRequest`

NewCreateAssetRequestWithDefaults instantiates a new CreateAssetRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetSubtype

`func (o *CreateAssetRequest) GetSubtype() string`

GetSubtype returns the Subtype field if non-nil, zero value otherwise.

### GetSubtypeOk

`func (o *CreateAssetRequest) GetSubtypeOk() (*string, bool)`

GetSubtypeOk returns a tuple with the Subtype field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubtype

`func (o *CreateAssetRequest) SetSubtype(v string)`

SetSubtype sets Subtype field to given value.

### HasSubtype

`func (o *CreateAssetRequest) HasSubtype() bool`

HasSubtype returns a boolean if a field has been set.

### GetPayload

`func (o *CreateAssetRequest) GetPayload() CreateAssetRequestPayload`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *CreateAssetRequest) GetPayloadOk() (*CreateAssetRequestPayload, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *CreateAssetRequest) SetPayload(v CreateAssetRequestPayload)`

SetPayload sets Payload field to given value.

### HasPayload

`func (o *CreateAssetRequest) HasPayload() bool`

HasPayload returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


