# GetAssets200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Base** | Pointer to **string** | Base URL that can be prepended to the &#39;href&#39; values in the &#39;links&#39; to produce fully qualified URLs for future queries. | [optional] 
**Resources** | Pointer to [**[]SuccessResourcesInner**](SuccessResourcesInner.md) |  | [optional] 
**Errors** | Pointer to [**[]SuccessAssetIdsQueryParamErrorsInner**](SuccessAssetIdsQueryParamErrorsInner.md) |  | [optional] 
**Links** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewGetAssets200Response

`func NewGetAssets200Response() *GetAssets200Response`

NewGetAssets200Response instantiates a new GetAssets200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetAssets200ResponseWithDefaults

`func NewGetAssets200ResponseWithDefaults() *GetAssets200Response`

NewGetAssets200ResponseWithDefaults instantiates a new GetAssets200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBase

`func (o *GetAssets200Response) GetBase() string`

GetBase returns the Base field if non-nil, zero value otherwise.

### GetBaseOk

`func (o *GetAssets200Response) GetBaseOk() (*string, bool)`

GetBaseOk returns a tuple with the Base field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBase

`func (o *GetAssets200Response) SetBase(v string)`

SetBase sets Base field to given value.

### HasBase

`func (o *GetAssets200Response) HasBase() bool`

HasBase returns a boolean if a field has been set.

### GetResources

`func (o *GetAssets200Response) GetResources() []SuccessResourcesInner`

GetResources returns the Resources field if non-nil, zero value otherwise.

### GetResourcesOk

`func (o *GetAssets200Response) GetResourcesOk() (*[]SuccessResourcesInner, bool)`

GetResourcesOk returns a tuple with the Resources field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResources

`func (o *GetAssets200Response) SetResources(v []SuccessResourcesInner)`

SetResources sets Resources field to given value.

### HasResources

`func (o *GetAssets200Response) HasResources() bool`

HasResources returns a boolean if a field has been set.

### GetErrors

`func (o *GetAssets200Response) GetErrors() []SuccessAssetIdsQueryParamErrorsInner`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *GetAssets200Response) GetErrorsOk() (*[]SuccessAssetIdsQueryParamErrorsInner, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *GetAssets200Response) SetErrors(v []SuccessAssetIdsQueryParamErrorsInner)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *GetAssets200Response) HasErrors() bool`

HasErrors returns a boolean if a field has been set.

### GetLinks

`func (o *GetAssets200Response) GetLinks() map[string]interface{}`

GetLinks returns the Links field if non-nil, zero value otherwise.

### GetLinksOk

`func (o *GetAssets200Response) GetLinksOk() (*map[string]interface{}, bool)`

GetLinksOk returns a tuple with the Links field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLinks

`func (o *GetAssets200Response) SetLinks(v map[string]interface{})`

SetLinks sets Links field to given value.

### HasLinks

`func (o *GetAssets200Response) HasLinks() bool`

HasLinks returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


