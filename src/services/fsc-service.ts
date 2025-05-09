import { SalesforceRestClient } from "./client";
import { SalesforceConfig } from "./config";

export class FinancialServiceCloudService extends SalesforceRestClient {
  constructor(config: SalesforceConfig) {
    super(config);
  }

  // LEAD
  async addLead({ model }:
    { model: any; }): Promise<any> {
    const response = await this.post(
      { url: "/data/v57.0/sobjects/Lead/", data: model });
    return response.data;
  }

  async getLead({ leadId }:
    { leadId: string; }): Promise<any> {
    const response = await this.get(
      { url: `/data/v57.0/sobjects/Lead/${leadId}` });
    return response.data;
  }

  // CASE
  async addCase({ model }:
    { model: any; }): Promise<any> {
    const response = await this.post(
      { url: "/data/v57.0/sobjects/Case/", data: model });
    return response.data;
  }

  async getCase({ caseId }:
    { caseId: string; }): Promise<any> {
    const response = await this.get(
      { url: `/data/v57.0/sobjects/Case/${caseId}` });

    console.log(response.data);

    return response.data;
  }

  async getAdviserCode(id: string) {
    const response = await this.get(
      { url: `/data/v62.0/sobjects/AdviserCode__c/${id}` });
    return response.data;
  }

  async updateCase({ model, caseId }:
    { model: any; caseId: string; }): Promise<any> {
    const response = Object.keys(model).length > 0 ? await this.patch(
      { url: `/data/v57.0/sobjects/Case/${caseId}`, data: model }) : null;
    return response?.data;
  }

  async deleteCase({ caseId }:
    { caseId: string; }): Promise<void> {
    await this.delete(
      { url: `/data/v57.0/sobjects/Case/${caseId}` });
    console.log("DELETED CASE FROMN FSC");
  }

  // APPLICANT
  async addApplicant({ model }:
    { model: any; }): Promise<any> {
    const response = await this.post({ url: "/data/v57.0/sobjects/Applicant__c/", data: model });
    return response.data;
  }

  async getApplicant({ applicantId }:
    { applicantId: string; }): Promise<any> {
    const response = await this.get(
      { url: `/data/v57.0/sobjects/Applicant__c/${applicantId}` });
    return response.data;
  }

  async deleteExistingTaxResidences({ applicantId }:
    { applicantId: string; }): Promise<void> {
    const taxResidences = await this.getApplicantTaxResidences({ applicantId });
    await Promise.all(
      taxResidences.map(async (tr: any) => {
        await this.delete(
          { url: `/data/v57.0/sobjects/ApplicantTaxResidency__c/${tr.Id}` });
      })
    );
  }

  async deleteExistingFundAllocations({ caseId }:
    { caseId: string; }): Promise<void> {
    const fundAllocations = await this.getCaseFunds({ caseId });
    console.info("Deleting fund allocations", fundAllocations);
    await Promise.all(
      fundAllocations.map(async (fa: any) => {
        await this.delete(
          { url: `/data/v57.0/sobjects/ApplicationFundAllocation__c/${fa.Id}` });
      })
    );
  }

  // DOCUMENTS
  async addDocument({ doc, applicationId, filename }:
    { doc: string; applicationId: string; filename: string; }): Promise<any> {
    const response = await this.post(
      {
        url: "/data/v57.0/sobjects/ContentVersion/", data: {
          Title: filename,
          PathOnClient: filename,
          ContentLocation: "S",
          FirstPublishLocationId: applicationId,
          versionData: doc
        }
      });
    return response?.data;
  }


  async getDocumentsForApplicant({ applicantId }:
    { applicantId: string; }): Promise<any> {
    const response = await this.get(
      { url: `/data/v57.0/query/?q=SELECT FIELDS(ALL) FROM ContentVersion where FirstPublishLocationId = '${applicantId}' LIMIT 50` });
    return response.data?.records;
  }

  async getContentDocumentId({ documentId }:
    { documentId: string; }): Promise<any> {
    const response = await this.get(
      { url: `/data/v57.0/query/?q=SELECT ContentDocumentId FROM ContentVersion where Id = '${documentId}' LIMIT 50` });
    if (response.data?.records) {
      return response.data.records[0].ContentDocumentId;
    } else {
      return null;
    }
  }

  async addContentDocumentLink({ contentDocumentId, linkedEntityId }: { contentDocumentId: string; linkedEntityId: string }) {
    const response = await this.post(
      {
        url: "/data/v62.0/sobjects/ContentDocumentLink",
        data: {
          ContentDocumentId: contentDocumentId,
          LinkedEntityId: linkedEntityId,
          ShareType: "V",
        }
      });

    return response?.data;
  }

  async deleteDocument({ documentId }:
    { documentId: string; }): Promise<any> {
    const contentDocumentId = await this.getContentDocumentId({ documentId });
    if (contentDocumentId) {
      const response = await this.delete(
        { url: `/data/v57.0/sobjects/ContentDocument/${contentDocumentId}`, params: null });
      return response?.data;
    } else { return null; }
  }


  async getCaseApplicants({ caseId }:
    { caseId: string; }): Promise<any> {
    const response = await this.get(
      { url: `/data/v57.0/query/?q=SELECT FIELDS(ALL) FROM Applicant__c where Application__c = '${caseId}' LIMIT 50` });
    return response.data?.records;
  }

  async getApplicantTaxResidences({ applicantId }:
    { applicantId: string; }): Promise<any> {
    const response = await this.get(
      { url: `/data/v57.0/query/?q=SELECT FIELDS(ALL) FROM ApplicantTaxResidency__c where Applicant__c = '${applicantId}' LIMIT 50` });
    return response.data?.records;
  }

  async getCaseFunds({ caseId }: { caseId: string; }): Promise<any> {
    const response = await this.get(
      { url: `/data/v57.0/query/?q=SELECT fields(all) FROM ApplicationFundAllocation__c where Application__c = '${caseId}' LIMIT 50` });
    return response.data?.records;
  }

  async getCaseFundsWithSourceSystemId({ caseId }: { caseId: string; }): Promise<any> {
    const response = await this.get(
      { url: `/data/v57.0/query/?q=SELECT fields(all),fund__r.FinServ__SourceSystemId__c FROM ApplicationFundAllocation__c where Application__c = '${caseId}' LIMIT 50` });
    return response.data?.records;
  }

  async updateAccountWithApexClientId({ kwPersonId, mmcBeneficiaryId }:
    { kwPersonId: string; mmcBeneficiaryId: string }): Promise<any> {

    if (!kwPersonId) {
      throw Error("Missing kwPersonId required field");
    }

    if (!mmcBeneficiaryId) {
      throw Error("Missing mmcBeneficiaryId required field");
    }

    // Ge the FSC account id for the kwPersonId;
    const id = await this.getClientByRegistryClientId(kwPersonId);

    if (!id) {
      throw Error(`No FSC account found for KWPersonID: ${kwPersonId}`);
    }

    return await this.patch(
      {
        url:
          `/data/v57.0/sobjects/Account/${id}`,
        data:
        {
          ApexClientID__c: mmcBeneficiaryId
        }
      }
    );
  }

  async insertFinancialAccounts(records: any[]): Promise<any> {
    const data: any = {
      allOrNone : false,
      records,
    };
    console.log("Financial account data", JSON.stringify(data));
    const response = await this.patch({ url: "/data/v59.0/composite/sobjects/Finserv__FinancialAccount__c/FinServ__SourceSystemId__c", data });
    return response.data;
  }

  async updateFinancialAccounts(records: any[]): Promise<any> {
    const data: any = {
      allOrNone : false,
      records,
    };
    console.log("Financial account data", JSON.stringify(data));
    const response = await this.patch({ url: "/data/v59.0/composite/sobjects/Finserv__FinancialAccount__c/FinServ__FinancialAccountNumber__c", data });
    return response.data;
  }

  async updateFinancialAccount(record: any): Promise<any> {
    return this.updateFinancialAccounts([record]);
  }

  // NOT USED
  async getCaseAndApplicants({ caseId }:
    { caseId: string; }): Promise<any> {
    const response = await this.get(
      { url: `/data/v57.0/query/?q=SELECT FIELDS(ALL),(SELECT FIELDS(ALL) from Applicants__r limit 10) FROM case where id = '${caseId}' LIMIT 200` });
    return response.data;
  }

  async getFunds(): Promise<any> {
    const response = await this.get(
      { url: "/data/v57.0/query/?q=SELECT FIELDS(ALL) FROM FinServ__Securities__c LIMIT 200" });
    return response.data?.records;
  }

  async setClientWebLogin(id: string, date: string) {
    const response = await this.patch(
      {
        url:
          `/data/v57.0/sobjects/Account/${id}`,
        data:
        {
          FFOWebLastLogin__c: date
        }
      }
    );
    return response?.data;
  }

  async setClientMobileLogin(id: string, date: string) {
    const response = await this.patch(
      {
        url: `/data/v57.0/sobjects/Account/${id}`, data:
        {
          FFOMobileLastLogin__c: date
        }
      }
    );
    return response?.data;
  }

  async getClientByRegistryClientId(registryCustomerId: string) {
    const response = await this.get(
      { url: `/data/v57.0/query/?q=SELECT Id FROM Account where TelClientId__c = '${registryCustomerId}' or KiwiWealthClientId__c = '${registryCustomerId}' LIMIT 50` }
    );
    if (response.data?.records && response.data.records.length > 0) {
      return response.data.records[0].Id;
    } else {
      return null;
    }
  }

  async getProductNameByFinancialAccountNumber(faNumber: string) {
    const response = await this.get(
      { url: `/data/v57.0/query/?q=SELECT Product__c FROM FinServ__FinancialAccount__c where FinServ__FinancialAccountNumber__c = '${faNumber}' LIMIT 50` }
    );
    if (response.data?.records && response.data.records.length > 0) {
      return response.data.records[0].Product__c;
    } else {
      return null;
    }
  }

  // Digital Advice Log
  async addDigitalAdviceLog({ model }: { model: any; }): Promise<any> {
    const response = await this.post(
      { url: "/data/v60.0/composite/tree/DigitalAdviceLog__c/", data: model });
    return response.data;
  }
}
