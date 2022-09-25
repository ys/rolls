# AddAssetsToAlbum201Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Base** | Pointer to **string** | Base URL that can be prepended to the &#39;href&#39; values in the &#39;links&#39; to produce fully qualified URLs for future queries. | [optional] 
**Resources** | Pointer to [**[]AddAssetsToAlbum201ResponseResourcesInner**](AddAssetsToAlbum201ResponseResourcesInner.md) |  | [optional] 
**Errors** | Pointer to [**[]AddAssetsToAlbum201ResponseErrorsInner**](AddAssetsToAlbum201ResponseErrorsInner.md) |  | [optional] 

## Methods

### NewAddAssetsToAlbum201Response

`func NewAddAssetsToAlbum201Response() *AddAssetsToAlbum201Response`

NewAddAssetsToAlbum201Response instantiates a new AddAssetsToAlbum201Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAddAssetsToAlbum201ResponseWithDefaults

`func NewAddAssetsToAlbum201ResponseWithDefaults() *AddAssetsToAlbum201Response`

NewAddAssetsToAlbum201ResponseWithDefaults instantiates a new AddAssetsToAlbum201Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBase

`func (o *AddAssetsToAlbum201Response) GetBase() string`

GetBase returns the Base field if non-nil, zero value otherwise.

### GetBaseOk

`func (o *AddAssetsToAlbum201Response) GetBaseOk() (*string, bool)`

GetBaseOk returns a tuple with the Base field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBase

`func (o *AddAssetsToAlbum201Response) SetBase(v string)`

SetBase sets Base field to given value.

### HasBase

`func (o *AddAssetsToAlbum201Response) HasBase() bool`

HasBase returns a boolean if a field has been set.

### GetResources

`func (o *AddAssetsToAlbum201Response) GetResources() []AddAssetsToAlbum201ResponseResourcesInner`

GetResources returns the Resources field if non-nil, zero value otherwise.

### GetResourcesOk

`func (o *AddAssetsToAlbum201Response) GetResourcesOk() (*[]AddAssetsToAlbum201ResponseResourcesInner, bool)`

GetResourcesOk returns a tuple with the Resources field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResources

`func (o *AddAssetsToAlbum201Response) SetResources(v []AddAssetsToAlbum201ResponseResourcesInner)`

SetResources sets Resources field to given value.

### HasResources

`func (o *AddAssetsToAlbum201Response) HasResources() bool`

HasResources returns a boolean if a field has been set.

### GetErrors

`func (o *AddAssetsToAlbum201Response) GetErrors() []AddAssetsToAlbum201ResponseErrorsInner`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *AddAssetsToAlbum201Response) GetErrorsOk() (*[]AddAssetsToAlbum201ResponseErrorsInner, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *AddAssetsToAlbum201Response) SetErrors(v []AddAssetsToAlbum201ResponseErrorsInner)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *AddAssetsToAlbum201Response) HasErrors() bool`

HasErrors returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


