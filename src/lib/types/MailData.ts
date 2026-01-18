export interface MailResult {
	SynergyMailDataXML: MailData;
}

export interface MailData {
	FolderListViews: FolderListViews;
	InboxItemListings: InboxItemListings;
	SentItemListings: SentItemListings;
	DraftItemListings: DraftItemListings;
	ArchiveItemListings: string;
	OutboxItemListings: string;
	AllOtherFolderMessages: string;
	'_xmlns:xsd': string;
	'_xmlns:xsi': string;
	_PersonGU: string;
	_NewSignature: string;
	_ReplySignature: string;
	_EnableForwarding: string;
	_emailAddresses: string;
	_ParentRecipientAccessValue: string;
	_StudentRecipientAccessValue: string;
	_StaffRecipientAccessValue: string;
	_UserGroupsTabAllowed: string;
	_MassEmailTabAllowed: string;
	_StudentGroupsTabAllowed: string;
	_ContactListsTabAllowed: string;
	_StaffTabAllowed: string;
	_ParentsTabAllowed: string;
	_StudentsTabAllowed: string;
	_ClassesTabAllowed: string;
	_TeachersTabAllowed: string;
	_CounselorsTabAllowed: string;
	_ShowBCC: string;
	_SynergyMailForwardingEnabled: string;
	_SM_CheckUnreadMessagesTimeout: string;
	_SM_MaxAttachmentSizeMB: string;
	_SM_JobTitleColumnVisible: string;
	_SM_TypeColumnVisible: string;
	_SM_ContactLogOption: string;
	_SM_SupportingClassesDropDown: string;
	_SM_SupportingMessageSubjectAsElement: string;
}

export interface DraftItemListings {
	MessageXML: DraftItemListingsMessageXML[];
}

export interface DraftItemListingsMessageXML {
	From: From;
	To: From | string;
	CC: string;
	BCC: string;
	Attachments: string;
	_SMMessageGU: string;
	_SMMsgPersonGU: string;
	_SendDateTime: string;
	_Subject: string;
	_MessageText: string;
	_FolderType: string;
	_Priority: Priority;
	_IsItDraft: string;
	_MailRead: string;
	_OriginalLanguageCode: string;
	_Translated: string;
	_SendDateTimeFormattedLong: string;
	_SendDateTimeFormattedShort: string;
	_ReadCount: string;
	_PersonCount: string;
	_UpdateContactLog: string;
	_TranslationComplete: string;
	_ContactCategory: ContactCategory;
	_AssociatedStudentGU: string;
	_IsMeeting: string;
	_VidConfGU: string;
	_MeetingStartDate: string;
	_Deleted: string;
	_NoReply: string;
	_EnforceSecurity: string;
	_MessageStatus: string;
	_MeetingEndDate: string;
	_CanJoinMeeting: string;
	_MeetingDateString: string;
	_MeetingHost: string;
	_Recurrence: string;
	_RecurrenceText: string;
}

export interface From {
	RecipientXML: RecipientXMLElement;
}

export interface RecipientXMLElement {
	_RecipientType: RecipientType;
	_GU?: string;
	_RecipientList: RecipientList;
	_GroupUserTypes: string;
	_Details1?: string;
	_Details2?: Details2;
	_ReadCount: string;
	_PersonCount: string;
	RecipientSectionList?: RecipientSectionListClass | string;
	_OrganizationYearGU?: string;
}

export interface RecipientSectionListClass {
	RecipientSection: RecipientSection;
}

/**
 * @interface RecipientSection
 * @property {string} _Period - Of the format period-period. If the period is 1, then the string will be 1-1.
 */
export interface RecipientSection {
	_SectionGU: string;
	_Teacher: string;
	_Period: string;
	_Term: Term;
	_SectionID: string;
	_CourseID: string;
	_Course: string;
	_Room: string;
	_Grade: string;
}

export enum Term {
	Yr = 'YR'
}

export enum Details2 {
	ParentsStudents = 'Parents & Students',
	Staff = 'Staff',
	Student = 'Student',
	Students = 'Students',
	Teacher = 'Teacher'
}

export enum RecipientList {
	Classes = 'Classes',
	External = 'External',
	MassEmail = 'MassEmail',
	Staff = 'Staff',
	Students = 'Students',
	Teachers = 'Teachers'
}

export enum RecipientType {
	From = 'From',
	To = 'To'
}

export enum ContactCategory {
	Me = 'ME',
	Sm = 'SM',
	Tcom = 'TCOM'
}

export enum Priority {
	None = 'None'
}

export interface FolderListViews {
	FolderListViewXML: FolderListViewXML[];
}

export interface FolderListViewXML {
	_FolderType: string;
	_SmFolderGU: string;
	_FolderName: string;
	_Icon: string;
	_UnreadMessages: string;
}

export interface InboxItemListings {
	MessageXML: InboxItemListingsMessageXML[];
}

export interface InboxItemListingsMessageXML {
	From: From;
	To: ToClass | string;
	CC: string;
	BCC: string;
	Attachments: AttachmentsClass | string;
	_SMMessageGU: string;
	_SMMsgPersonGU: string;
	_SendDateTime: string;
	_Subject: string;
	_MessageText: string;
	_FolderType: FolderType;
	_Priority: Priority;
	_IsItDraft: string;
	_MailRead: string;
	_OriginalLanguageCode: string;
	_Translated: string;
	_SendDateTimeFormattedLong: string;
	_SendDateTimeFormattedShort: string;
	_ReadCount: string;
	_PersonCount: string;
	_UpdateContactLog: string;
	_TranslationComplete: string;
	_ContactCategory: ContactCategory;
	_AssociatedStudentGU: string;
	_IsMeeting: string;
	_VidConfGU: string;
	_MeetingStartDate: string;
	_Deleted: string;
	_NoReply: string;
	_EnforceSecurity: string;
	_MessageStatus: MessageStatus;
	_MeetingEndDate: string;
	_CanJoinMeeting: string;
	_MeetingDateString: string;
	_MeetingHost: string;
	_Recurrence: string;
	_RecurrenceText: string;
}

export interface AttachmentsClass {
	AttachmentXML: AttachmentXML | AttachmentXML[];
}

export interface AttachmentXML {
	_SmAttachmentGU: string;
	_DocumentName: string;
}

export interface ToClass {
	RecipientXML: RecipientXMLElement[] | RecipientXMLElement;
}

export enum FolderType {
	Inbox = 'Inbox'
}

export enum MessageStatus {
	Sent = 'Sent'
}

export interface SentItemListings {
	MessageXML: SentItemListingsMessageXML[];
}

export interface SentItemListingsMessageXML {
	From: From;
	To: From;
	CC: string;
	BCC: string;
	Attachments: string;
	_SMMessageGU: string;
	_SMMsgPersonGU: string;
	_SendDateTime: string;
	_Subject: string;
	_MessageText: string;
	_FolderType: MessageStatus;
	_Priority: Priority;
	_IsItDraft: string;
	_MailRead: string;
	_OriginalLanguageCode: string;
	_Translated: string;
	_SendDateTimeFormattedLong: string;
	_SendDateTimeFormattedShort: string;
	_ReadCount: string;
	_PersonCount: string;
	_UpdateContactLog: string;
	_TranslationComplete: string;
	_ContactCategory: string;
	_AssociatedStudentGU: string;
	_IsMeeting: string;
	_VidConfGU: string;
	_MeetingStartDate: string;
	_Deleted: string;
	_NoReply: string;
	_EnforceSecurity: string;
	_MessageStatus: MessageStatus;
	_MeetingEndDate: string;
	_CanJoinMeeting: string;
	_MeetingDateString: string;
	_MeetingHost: string;
	_Recurrence: string;
	_RecurrenceText: string;
	_OriginalLanguageDescription?: string;
	_OriginalMessageText?: string;
	_OriginalSubjectText?: string;
}
