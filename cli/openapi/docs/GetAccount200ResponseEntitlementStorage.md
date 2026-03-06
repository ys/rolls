# GetAccount200ResponseEntitlementStorage

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Used** | Pointer to **int32** | The size in bytes of content this account that count against the storage limit. | [optional] 
**Warn** | Pointer to **int32** | Value of used at which the client applications should start warning the user. Absence indicates no warning should be given. | [optional] 
**Limit** | Pointer to **int32** | Specifies the storage limit in bytes that should be enforced for this account. It will always be greater than or equal to the display_limit. | [optional] 
**DisplayLimit** | Pointer to **int32** | Specifies the storage limit in bytes that is displayed to the user for this account. | [optional] 

## Methods

### NewGetAccount200ResponseEntitlementStorage

`func NewGetAccount200ResponseEntitlementStorage() *GetAccount200ResponseEntitlementStorage`

NewGetAccount200ResponseEntitlementStorage instantiates a new GetAccount200ResponseEntitlementStorage object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetAccount200ResponseEntitlementStorageWithDefaults

`func NewGetAccount200ResponseEntitlementStorageWithDefaults() *GetAccount200ResponseEntitlementStorage`

NewGetAccount200ResponseEntitlementStorageWithDefaults instantiates a new GetAccount200ResponseEntitlementStorage object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUsed

`func (o *GetAccount200ResponseEntitlementStorage) GetUsed() int32`

GetUsed returns the Used field if non-nil, zero value otherwise.

### GetUsedOk

`func (o *GetAccount200ResponseEntitlementStorage) GetUsedOk() (*int32, bool)`

GetUsedOk returns a tuple with the Used field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsed

`func (o *GetAccount200ResponseEntitlementStorage) SetUsed(v int32)`

SetUsed sets Used field to given value.

### HasUsed

`func (o *GetAccount200ResponseEntitlementStorage) HasUsed() bool`

HasUsed returns a boolean if a field has been set.

### GetWarn

`func (o *GetAccount200ResponseEntitlementStorage) GetWarn() int32`

GetWarn returns the Warn field if non-nil, zero value otherwise.

### GetWarnOk

`func (o *GetAccount200ResponseEntitlementStorage) GetWarnOk() (*int32, bool)`

GetWarnOk returns a tuple with the Warn field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWarn

`func (o *GetAccount200ResponseEntitlementStorage) SetWarn(v int32)`

SetWarn sets Warn field to given value.

### HasWarn

`func (o *GetAccount200ResponseEntitlementStorage) HasWarn() bool`

HasWarn returns a boolean if a field has been set.

### GetLimit

`func (o *GetAccount200ResponseEntitlementStorage) GetLimit() int32`

GetLimit returns the Limit field if non-nil, zero value otherwise.

### GetLimitOk

`func (o *GetAccount200ResponseEntitlementStorage) GetLimitOk() (*int32, bool)`

GetLimitOk returns a tuple with the Limit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLimit

`func (o *GetAccount200ResponseEntitlementStorage) SetLimit(v int32)`

SetLimit sets Limit field to given value.

### HasLimit

`func (o *GetAccount200ResponseEntitlementStorage) HasLimit() bool`

HasLimit returns a boolean if a field has been set.

### GetDisplayLimit

`func (o *GetAccount200ResponseEntitlementStorage) GetDisplayLimit() int32`

GetDisplayLimit returns the DisplayLimit field if non-nil, zero value otherwise.

### GetDisplayLimitOk

`func (o *GetAccount200ResponseEntitlementStorage) GetDisplayLimitOk() (*int32, bool)`

GetDisplayLimitOk returns a tuple with the DisplayLimit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDisplayLimit

`func (o *GetAccount200ResponseEntitlementStorage) SetDisplayLimit(v int32)`

SetDisplayLimit sets DisplayLimit field to given value.

### HasDisplayLimit

`func (o *GetAccount200ResponseEntitlementStorage) HasDisplayLimit() bool`

HasDisplayLimit returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


