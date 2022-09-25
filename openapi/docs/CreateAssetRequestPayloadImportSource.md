# CreateAssetRequestPayloadImportSource

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**FileName** | **string** |  | 
**ImportedOnDevice** | **string** | Name of the device that imported the image. | 
**ImportedBy** | **string** | Account ID of the user who imported the asset. | 
**ImportTimestamp** | **string** | datetime in ISO-8601 format (e.g. 2016-01-15T16:18:00-05:00) with both date and time required, including seconds, but timezone optional. Also flexible on allowing some nonstandard timezone formats like 2016-01-15T12:10:32+0000 or 2016-01-15T12:10:32-05. | 

## Methods

### NewCreateAssetRequestPayloadImportSource

`func NewCreateAssetRequestPayloadImportSource(fileName string, importedOnDevice string, importedBy string, importTimestamp string, ) *CreateAssetRequestPayloadImportSource`

NewCreateAssetRequestPayloadImportSource instantiates a new CreateAssetRequestPayloadImportSource object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateAssetRequestPayloadImportSourceWithDefaults

`func NewCreateAssetRequestPayloadImportSourceWithDefaults() *CreateAssetRequestPayloadImportSource`

NewCreateAssetRequestPayloadImportSourceWithDefaults instantiates a new CreateAssetRequestPayloadImportSource object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetFileName

`func (o *CreateAssetRequestPayloadImportSource) GetFileName() string`

GetFileName returns the FileName field if non-nil, zero value otherwise.

### GetFileNameOk

`func (o *CreateAssetRequestPayloadImportSource) GetFileNameOk() (*string, bool)`

GetFileNameOk returns a tuple with the FileName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFileName

`func (o *CreateAssetRequestPayloadImportSource) SetFileName(v string)`

SetFileName sets FileName field to given value.


### GetImportedOnDevice

`func (o *CreateAssetRequestPayloadImportSource) GetImportedOnDevice() string`

GetImportedOnDevice returns the ImportedOnDevice field if non-nil, zero value otherwise.

### GetImportedOnDeviceOk

`func (o *CreateAssetRequestPayloadImportSource) GetImportedOnDeviceOk() (*string, bool)`

GetImportedOnDeviceOk returns a tuple with the ImportedOnDevice field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetImportedOnDevice

`func (o *CreateAssetRequestPayloadImportSource) SetImportedOnDevice(v string)`

SetImportedOnDevice sets ImportedOnDevice field to given value.


### GetImportedBy

`func (o *CreateAssetRequestPayloadImportSource) GetImportedBy() string`

GetImportedBy returns the ImportedBy field if non-nil, zero value otherwise.

### GetImportedByOk

`func (o *CreateAssetRequestPayloadImportSource) GetImportedByOk() (*string, bool)`

GetImportedByOk returns a tuple with the ImportedBy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetImportedBy

`func (o *CreateAssetRequestPayloadImportSource) SetImportedBy(v string)`

SetImportedBy sets ImportedBy field to given value.


### GetImportTimestamp

`func (o *CreateAssetRequestPayloadImportSource) GetImportTimestamp() string`

GetImportTimestamp returns the ImportTimestamp field if non-nil, zero value otherwise.

### GetImportTimestampOk

`func (o *CreateAssetRequestPayloadImportSource) GetImportTimestampOk() (*string, bool)`

GetImportTimestampOk returns a tuple with the ImportTimestamp field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetImportTimestamp

`func (o *CreateAssetRequestPayloadImportSource) SetImportTimestamp(v string)`

SetImportTimestamp sets ImportTimestamp field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


