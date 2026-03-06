# CreateAlbum400Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Errors** | Pointer to [**InvaildRequestPayloadErrors**](InvaildRequestPayloadErrors.md) |  | [optional] 
**Code** | Pointer to **int32** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 

## Methods

### NewCreateAlbum400Response

`func NewCreateAlbum400Response() *CreateAlbum400Response`

NewCreateAlbum400Response instantiates a new CreateAlbum400Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateAlbum400ResponseWithDefaults

`func NewCreateAlbum400ResponseWithDefaults() *CreateAlbum400Response`

NewCreateAlbum400ResponseWithDefaults instantiates a new CreateAlbum400Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetErrors

`func (o *CreateAlbum400Response) GetErrors() InvaildRequestPayloadErrors`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *CreateAlbum400Response) GetErrorsOk() (*InvaildRequestPayloadErrors, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *CreateAlbum400Response) SetErrors(v InvaildRequestPayloadErrors)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *CreateAlbum400Response) HasErrors() bool`

HasErrors returns a boolean if a field has been set.

### GetCode

`func (o *CreateAlbum400Response) GetCode() int32`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *CreateAlbum400Response) GetCodeOk() (*int32, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *CreateAlbum400Response) SetCode(v int32)`

SetCode sets Code field to given value.

### HasCode

`func (o *CreateAlbum400Response) HasCode() bool`

HasCode returns a boolean if a field has been set.

### GetDescription

`func (o *CreateAlbum400Response) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *CreateAlbum400Response) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *CreateAlbum400Response) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *CreateAlbum400Response) HasDescription() bool`

HasDescription returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


