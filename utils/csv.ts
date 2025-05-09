
import { Readable } from "stream";
import fs from 'fs';


const csv = require("csv-parser");

export function processCsv(stream: Readable) {
  return new Promise<any>((resolve, reject) => {
    const rows: any[] = [];
    const parser = stream.pipe(csv());
    parser.on("headers", (headers: any) => {
      console.log("CSV Headers:", headers);
    });
    parser.on("data", (row: any) => {
      rows.push(row);
    });
    parser.on("end", async () => {
      console.log("CSV file successfully processed");
      resolve(rows);
    });
    parser.on("error", (error: any) => {
      reject(error);
    });
  });
}

export function processLocalCsv(filePath: string) {
    const stream = fs.createReadStream(filePath); 
    return processCsv(stream); // 直接复用原函数 
  }
