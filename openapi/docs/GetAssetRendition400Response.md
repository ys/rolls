# GetAssetRendition400Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Errors** | Pointer to [**InvaildRequestRenditionTypeErrors**](InvaildRequestRenditionTypeErrors.md) |  | [optional] 
**Code** | Pointer to **int32** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 

## Methods

### NewGetAssetRendition400Response

`func NewGetAssetRendition400Response() *GetAssetRendition400Response`

NewGetAssetRendition400Response instantiates a new GetAssetRendition400Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetAssetRendition400ResponseWithDefaults

`func NewGetAssetRendition400ResponseWithDefaults() *GetAssetRendition400Response`

NewGetAssetRendition400ResponseWithDefaults instantiates a new GetAssetRendition400Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetErrors

`func (o *GetAssetRendition400Response) GetErrors() InvaildRequestRenditionTypeErrors`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *GetAssetRendition400Response) GetErrorsOk() (*InvaildRequestRenditionTypeErrors, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *GetAssetRendition400Response) SetErrors(v InvaildRequestRenditionTypeErrors)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *GetAssetRendition400Response) HasErrors() bool`

HasErrors returns a boolean if a field has been set.

### GetCode

`func (o *GetAssetRendition400Response) GetCode() int32`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *GetAssetRendition400Response) GetCodeOk() (*int32, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *GetAssetRendition400Response) SetCode(v int32)`

SetCode sets Code field to given value.

### HasCode

`func (o *GetAssetRendition400Response) HasCode() bool`

HasCode returns a boolean if a field has been set.

### GetDescription

`func (o *GetAssetRendition400Response) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *GetAssetRendition400Response) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *GetAssetRendition400Response) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *GetAssetRendition400Response) HasDescription() bool`

HasDescription returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


