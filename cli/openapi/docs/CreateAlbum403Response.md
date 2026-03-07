# CreateAlbum403Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Code** | Pointer to **int32** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 
**Errors** | Pointer to [**ForbiddenExistsErrorErrors**](ForbiddenExistsErrorErrors.md) |  | [optional] 

## Methods

### NewCreateAlbum403Response

`func NewCreateAlbum403Response() *CreateAlbum403Response`

NewCreateAlbum403Response instantiates a new CreateAlbum403Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateAlbum403ResponseWithDefaults

`func NewCreateAlbum403ResponseWithDefaults() *CreateAlbum403Response`

NewCreateAlbum403ResponseWithDefaults instantiates a new CreateAlbum403Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCode

`func (o *CreateAlbum403Response) GetCode() int32`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *CreateAlbum403Response) GetCodeOk() (*int32, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *CreateAlbum403Response) SetCode(v int32)`

SetCode sets Code field to given value.

### HasCode

`func (o *CreateAlbum403Response) HasCode() bool`

HasCode returns a boolean if a field has been set.

### GetDescription

`func (o *CreateAlbum403Response) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *CreateAlbum403Response) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *CreateAlbum403Response) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *CreateAlbum403Response) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetErrors

`func (o *CreateAlbum403Response) GetErrors() ForbiddenExistsErrorErrors`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *CreateAlbum403Response) GetErrorsOk() (*ForbiddenExistsErrorErrors, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *CreateAlbum403Response) SetErrors(v ForbiddenExistsErrorErrors)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *CreateAlbum403Response) HasErrors() bool`

HasErrors returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


