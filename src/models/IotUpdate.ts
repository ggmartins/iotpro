export interface IotUpdate {
    Key: string
    uuid: string
    createdAt: string
    id: string
    idType: string
    LastSeen: string
    bundleList: Array<string>
    bundleListType: Array<string>
    bundleListDesc: Array<string>
    bundleListUUID: Array<string>
    HasChanged?: Array<string>
    BundleListAdd?: Array<string>
    BundleListDel?: Array<string>
    attachmentUrl?: string
}