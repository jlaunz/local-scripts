import axios, { AxiosPromise, AxiosInstance } from "axios";
import FormData from "form-data"
import { logError } from "../../utils/logging";
import { SalesforceConfig } from "./config";

abstract class Client<T> {
  protected config: T;
  
  constructor(config: T) {
    this.config = config;
  }
}
  

export abstract class SalesforceRestClient extends Client<SalesforceConfig> {
  protected instance: AxiosInstance;
  protected token: string;

  constructor(config: SalesforceConfig) {
    super(config);

    this.instance = axios.create({
      baseURL: config.endpoint
    });

    // Handle auth
    this.instance.interceptors.response.use((response: any) => {
      return response;
    }, async (error: { config: any; response: any; }) => {    
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const access_token = await this.getToken();   
        this.instance.defaults.headers.common["Authorization"] = "Bearer " + access_token;
        console.log("NEW SF TOKEN AQUIRED");
        return this.instance(originalRequest);
      }  
      const r = error.response?.data ? error.response?.data : error.response;
      return Promise.reject(r);
    });
  }

  async getToken() {
    try {      
      const formData = new FormData();
      formData.append("grant_type", "password");
      formData.append("username", this.config.user);
      formData.append("password", this.config.password);
      formData.append("client_id", this.config.clientKey);
      formData.append("client_secret", this.config.clientSecret);

      const response = await axios({
        url: `${this.config.endpoint}/oauth2/token`,
        method: "POST",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
          "Accept-Encoding": "application/json",
        },
        data: formData,
      });
      
      return response.data.access_token;
    } catch (error: any) {
      if (error.response) {
        logError(error.message || error, `Salesforce access token error response: [${error.response.status}], [${JSON.stringify(error.response.data)}]}]`);
      } else if (error.request) {
        logError(error.message || error, `Salesforce access token request failed: [${error.request}]`);
      } else {
        logError(error.message || error, "Salesforce access token error:");
      }
      throw new Error("Can't get access token");
    }
  }

  getRequestConfig({ params }:
     { params?: any; } = {}) {  
    return {
      headers: {
        "Content-Type": "application/json",
      },
      params
    };
  }

  public async get({ url, params }:
     { url: string; params?: any; }): Promise<AxiosPromise> {
    return await this.instance.get(url, this.getRequestConfig({ params }));
  }

  public async put({ url, data, params }:
     { url: string; data?: any; params?: any; }): Promise<AxiosPromise> {
    return await this.instance.put(url, data, this.getRequestConfig({ params }));
  }

  public async post({ url, data, params }:
     { url: string; data?: any; params?: any; }): Promise<AxiosPromise> {
    return await this.instance.post(url, data, this.getRequestConfig({ params }));
  }

  public async patch({ url, data, params }:
     { url: string; data?: any; params?: any; }): Promise<AxiosPromise> {
    return await this.instance.patch(url, data, this.getRequestConfig({ params }));
  }

  public async delete({ url, params }:
     { url: string; params?: any; }): Promise<AxiosPromise> {
    return await this.instance.delete(url, this.getRequestConfig({ params }));
  }
}
