# GetAlbums200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Base** | Pointer to **string** | Base URL that can be prepended to the &#39;href&#39; values in the &#39;links&#39; to produce fully qualified URLs for future queries. | [optional] 
**Resources** | Pointer to [**[]GetAlbums200ResponseResourcesInner**](GetAlbums200ResponseResourcesInner.md) |  | [optional] 

## Methods

### NewGetAlbums200Response

`func NewGetAlbums200Response() *GetAlbums200Response`

NewGetAlbums200Response instantiates a new GetAlbums200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetAlbums200ResponseWithDefaults

`func NewGetAlbums200ResponseWithDefaults() *GetAlbums200Response`

NewGetAlbums200ResponseWithDefaults instantiates a new GetAlbums200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBase

`func (o *GetAlbums200Response) GetBase() string`

GetBase returns the Base field if non-nil, zero value otherwise.

### GetBaseOk

`func (o *GetAlbums200Response) GetBaseOk() (*string, bool)`

GetBaseOk returns a tuple with the Base field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBase

`func (o *GetAlbums200Response) SetBase(v string)`

SetBase sets Base field to given value.

### HasBase

`func (o *GetAlbums200Response) HasBase() bool`

HasBase returns a boolean if a field has been set.

### GetResources

`func (o *GetAlbums200Response) GetResources() []GetAlbums200ResponseResourcesInner`

GetResources returns the Resources field if non-nil, zero value otherwise.

### GetResourcesOk

`func (o *GetAlbums200Response) GetResourcesOk() (*[]GetAlbums200ResponseResourcesInner, bool)`

GetResourcesOk returns a tuple with the Resources field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResources

`func (o *GetAlbums200Response) SetResources(v []GetAlbums200ResponseResourcesInner)`

SetResources sets Resources field to given value.

### HasResources

`func (o *GetAlbums200Response) HasResources() bool`

HasResources returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


