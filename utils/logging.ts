// Logger Functions
export const logInfo = (message: string | any, title: string | undefined = undefined): void => {
  if (typeof message === "string") {
    title ? console.info(`CRM-API-INFO: ${title}: ${message}`) : console.info(`CRM-API-INFO: ${message}`);   
  } else {
    title ? console.info(`CRM-API-INFO: ${title}:`, JSON.stringify(message, null, 2)) : console.info(`CRM-API-INFO: ${JSON.stringify(message, null, 2)}`);   
  }
};
export const logError = (message: string | any, title: string | undefined = undefined): void => {
  if (typeof message === "string") {
    title ? console.error(`CRM-API-ERROR: ${title}: ${message}`) : console.error(`CRM-API-ERROR: ${message}`);  
  } else {
    title ? console.error(`CRM-API-ERROR: ${title}:`, JSON.stringify(message, null, 2)) :  console.error(`CRM-API-ERROR: ${JSON.stringify(message, null, 2)}`);
  }
};
export const logWarn = (message: string | any, title: string | undefined = undefined): void => {
  if (typeof message === "string") {
    title ? console.warn(`CRM-API-WARN: ${title}: ${message}`) : console.warn(`CRM-API-WARN: ${message}`);   
  } else {
    title ? console.warn(`CRM-API-WARN: ${title}:`, JSON.stringify(message, null, 2)) : console.warn(`CRM-API-WARN: ${JSON.stringify(message, null, 2)}`);   
  }
};
export const logDebug = (message: string | any, title: string | undefined = undefined): void => {
  if (process.env.LOG_LEVEL === "debug") {
    if (typeof message === "string") {
      title ? console.debug(`CRM-API-DEBUG: ${title}: ${message}`) : console.debug(`CRM-API-DEBUG: ${message}`);   
    } else {
      title ? console.debug(`CRM-API-DEBUG: ${title}:`, JSON.stringify(message, null, 2)) : console.debug(`CRM-API-DEBUG: ${JSON.stringify(message, null, 2)}`);   
    }
  }
};
