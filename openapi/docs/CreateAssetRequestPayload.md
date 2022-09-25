# CreateAssetRequestPayload

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**UserCreated** | Pointer to **string** | datetime in ISO-8601 format (e.g. 2016-01-15T16:18:00-05:00) with both date and time required, including seconds, but timezone optional. Also flexible on allowing some nonstandard timezone formats like 2016-01-15T12:10:32+0000 or 2016-01-15T12:10:32-05. | [optional] 
**UserUpdated** | Pointer to **string** | datetime in ISO-8601 format (e.g. 2016-01-15T16:18:00-05:00) with both date and time required, including seconds, but timezone optional. Also flexible on allowing some nonstandard timezone formats like 2016-01-15T12:10:32+0000 or 2016-01-15T12:10:32-05. | [optional] 
**CaptureDate** | Pointer to **string** | Capture date of the asset in ISO-8601 format. Will be populated by the server automatically from the master if set to &#39;0000-00-00T00:00:00&#39; | [optional] 
**ImportSource** | Pointer to [**CreateAssetRequestPayloadImportSource**](CreateAssetRequestPayloadImportSource.md) |  | [optional] 

## Methods

### NewCreateAssetRequestPayload

`func NewCreateAssetRequestPayload() *CreateAssetRequestPayload`

NewCreateAssetRequestPayload instantiates a new CreateAssetRequestPayload object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateAssetRequestPayloadWithDefaults

`func NewCreateAssetRequestPayloadWithDefaults() *CreateAssetRequestPayload`

NewCreateAssetRequestPayloadWithDefaults instantiates a new CreateAssetRequestPayload object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUserCreated

`func (o *CreateAssetRequestPayload) GetUserCreated() string`

GetUserCreated returns the UserCreated field if non-nil, zero value otherwise.

### GetUserCreatedOk

`func (o *CreateAssetRequestPayload) GetUserCreatedOk() (*string, bool)`

GetUserCreatedOk returns a tuple with the UserCreated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserCreated

`func (o *CreateAssetRequestPayload) SetUserCreated(v string)`

SetUserCreated sets UserCreated field to given value.

### HasUserCreated

`func (o *CreateAssetRequestPayload) HasUserCreated() bool`

HasUserCreated returns a boolean if a field has been set.

### GetUserUpdated

`func (o *CreateAssetRequestPayload) GetUserUpdated() string`

GetUserUpdated returns the UserUpdated field if non-nil, zero value otherwise.

### GetUserUpdatedOk

`func (o *CreateAssetRequestPayload) GetUserUpdatedOk() (*string, bool)`

GetUserUpdatedOk returns a tuple with the UserUpdated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserUpdated

`func (o *CreateAssetRequestPayload) SetUserUpdated(v string)`

SetUserUpdated sets UserUpdated field to given value.

### HasUserUpdated

`func (o *CreateAssetRequestPayload) HasUserUpdated() bool`

HasUserUpdated returns a boolean if a field has been set.

### GetCaptureDate

`func (o *CreateAssetRequestPayload) GetCaptureDate() string`

GetCaptureDate returns the CaptureDate field if non-nil, zero value otherwise.

### GetCaptureDateOk

`func (o *CreateAssetRequestPayload) GetCaptureDateOk() (*string, bool)`

GetCaptureDateOk returns a tuple with the CaptureDate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCaptureDate

`func (o *CreateAssetRequestPayload) SetCaptureDate(v string)`

SetCaptureDate sets CaptureDate field to given value.

### HasCaptureDate

`func (o *CreateAssetRequestPayload) HasCaptureDate() bool`

HasCaptureDate returns a boolean if a field has been set.

### GetImportSource

`func (o *CreateAssetRequestPayload) GetImportSource() CreateAssetRequestPayloadImportSource`

GetImportSource returns the ImportSource field if non-nil, zero value otherwise.

### GetImportSourceOk

`func (o *CreateAssetRequestPayload) GetImportSourceOk() (*CreateAssetRequestPayloadImportSource, bool)`

GetImportSourceOk returns a tuple with the ImportSource field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetImportSource

`func (o *CreateAssetRequestPayload) SetImportSource(v CreateAssetRequestPayloadImportSource)`

SetImportSource sets ImportSource field to given value.

### HasImportSource

`func (o *CreateAssetRequestPayload) HasImportSource() bool`

HasImportSource returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


