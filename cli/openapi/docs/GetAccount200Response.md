# GetAccount200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Base** | Pointer to **string** | Base URL that can be prepended to the &#39;href&#39; values in the &#39;links&#39; to produce fully qualified URLs for future queries. | [optional] 
**Id** | Pointer to **string** |  | [optional] 
**Created** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Updated** | Pointer to **string** | datetime in RFC-3339 format (subset of ISO-8601) requiring a UTC time ending with Z (so -00:00 or +00-00 suffix NOT allowed). The datetime must have date and time, including seconds, e.g. 2016-01-15T09:23:34Z. | [optional] 
**Type** | Pointer to **string** |  | [optional] 
**Email** | Pointer to **string** |  | [optional] 
**FullName** | Pointer to **string** |  | [optional] 
**FirstName** | Pointer to **string** |  | [optional] 
**LastName** | Pointer to **string** |  | [optional] 
**WcdGuid** | Pointer to **string** |  | [optional] 
**Country** | Pointer to **string** |  | [optional] 
**Config** | Pointer to **map[string]interface{}** |  | [optional] 
**Entitlement** | Pointer to [**GetAccount200ResponseEntitlement**](GetAccount200ResponseEntitlement.md) |  | [optional] 

## Methods

### NewGetAccount200Response

`func NewGetAccount200Response() *GetAccount200Response`

NewGetAccount200Response instantiates a new GetAccount200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetAccount200ResponseWithDefaults

`func NewGetAccount200ResponseWithDefaults() *GetAccount200Response`

NewGetAccount200ResponseWithDefaults instantiates a new GetAccount200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBase

`func (o *GetAccount200Response) GetBase() string`

GetBase returns the Base field if non-nil, zero value otherwise.

### GetBaseOk

`func (o *GetAccount200Response) GetBaseOk() (*string, bool)`

GetBaseOk returns a tuple with the Base field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBase

`func (o *GetAccount200Response) SetBase(v string)`

SetBase sets Base field to given value.

### HasBase

`func (o *GetAccount200Response) HasBase() bool`

HasBase returns a boolean if a field has been set.

### GetId

`func (o *GetAccount200Response) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *GetAccount200Response) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *GetAccount200Response) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *GetAccount200Response) HasId() bool`

HasId returns a boolean if a field has been set.

### GetCreated

`func (o *GetAccount200Response) GetCreated() string`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *GetAccount200Response) GetCreatedOk() (*string, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *GetAccount200Response) SetCreated(v string)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *GetAccount200Response) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *GetAccount200Response) GetUpdated() string`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *GetAccount200Response) GetUpdatedOk() (*string, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *GetAccount200Response) SetUpdated(v string)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *GetAccount200Response) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetType

`func (o *GetAccount200Response) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *GetAccount200Response) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *GetAccount200Response) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *GetAccount200Response) HasType() bool`

HasType returns a boolean if a field has been set.

### GetEmail

`func (o *GetAccount200Response) GetEmail() string`

GetEmail returns the Email field if non-nil, zero value otherwise.

### GetEmailOk

`func (o *GetAccount200Response) GetEmailOk() (*string, bool)`

GetEmailOk returns a tuple with the Email field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmail

`func (o *GetAccount200Response) SetEmail(v string)`

SetEmail sets Email field to given value.

### HasEmail

`func (o *GetAccount200Response) HasEmail() bool`

HasEmail returns a boolean if a field has been set.

### GetFullName

`func (o *GetAccount200Response) GetFullName() string`

GetFullName returns the FullName field if non-nil, zero value otherwise.

### GetFullNameOk

`func (o *GetAccount200Response) GetFullNameOk() (*string, bool)`

GetFullNameOk returns a tuple with the FullName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFullName

`func (o *GetAccount200Response) SetFullName(v string)`

SetFullName sets FullName field to given value.

### HasFullName

`func (o *GetAccount200Response) HasFullName() bool`

HasFullName returns a boolean if a field has been set.

### GetFirstName

`func (o *GetAccount200Response) GetFirstName() string`

GetFirstName returns the FirstName field if non-nil, zero value otherwise.

### GetFirstNameOk

`func (o *GetAccount200Response) GetFirstNameOk() (*string, bool)`

GetFirstNameOk returns a tuple with the FirstName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFirstName

`func (o *GetAccount200Response) SetFirstName(v string)`

SetFirstName sets FirstName field to given value.

### HasFirstName

`func (o *GetAccount200Response) HasFirstName() bool`

HasFirstName returns a boolean if a field has been set.

### GetLastName

`func (o *GetAccount200Response) GetLastName() string`

GetLastName returns the LastName field if non-nil, zero value otherwise.

### GetLastNameOk

`func (o *GetAccount200Response) GetLastNameOk() (*string, bool)`

GetLastNameOk returns a tuple with the LastName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLastName

`func (o *GetAccount200Response) SetLastName(v string)`

SetLastName sets LastName field to given value.

### HasLastName

`func (o *GetAccount200Response) HasLastName() bool`

HasLastName returns a boolean if a field has been set.

### GetWcdGuid

`func (o *GetAccount200Response) GetWcdGuid() string`

GetWcdGuid returns the WcdGuid field if non-nil, zero value otherwise.

### GetWcdGuidOk

`func (o *GetAccount200Response) GetWcdGuidOk() (*string, bool)`

GetWcdGuidOk returns a tuple with the WcdGuid field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWcdGuid

`func (o *GetAccount200Response) SetWcdGuid(v string)`

SetWcdGuid sets WcdGuid field to given value.

### HasWcdGuid

`func (o *GetAccount200Response) HasWcdGuid() bool`

HasWcdGuid returns a boolean if a field has been set.

### GetCountry

`func (o *GetAccount200Response) GetCountry() string`

GetCountry returns the Country field if non-nil, zero value otherwise.

### GetCountryOk

`func (o *GetAccount200Response) GetCountryOk() (*string, bool)`

GetCountryOk returns a tuple with the Country field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCountry

`func (o *GetAccount200Response) SetCountry(v string)`

SetCountry sets Country field to given value.

### HasCountry

`func (o *GetAccount200Response) HasCountry() bool`

HasCountry returns a boolean if a field has been set.

### GetConfig

`func (o *GetAccount200Response) GetConfig() map[string]interface{}`

GetConfig returns the Config field if non-nil, zero value otherwise.

### GetConfigOk

`func (o *GetAccount200Response) GetConfigOk() (*map[string]interface{}, bool)`

GetConfigOk returns a tuple with the Config field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfig

`func (o *GetAccount200Response) SetConfig(v map[string]interface{})`

SetConfig sets Config field to given value.

### HasConfig

`func (o *GetAccount200Response) HasConfig() bool`

HasConfig returns a boolean if a field has been set.

### GetEntitlement

`func (o *GetAccount200Response) GetEntitlement() GetAccount200ResponseEntitlement`

GetEntitlement returns the Entitlement field if non-nil, zero value otherwise.

### GetEntitlementOk

`func (o *GetAccount200Response) GetEntitlementOk() (*GetAccount200ResponseEntitlement, bool)`

GetEntitlementOk returns a tuple with the Entitlement field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEntitlement

`func (o *GetAccount200Response) SetEntitlement(v GetAccount200ResponseEntitlement)`

SetEntitlement sets Entitlement field to given value.

### HasEntitlement

`func (o *GetAccount200Response) HasEntitlement() bool`

HasEntitlement returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


