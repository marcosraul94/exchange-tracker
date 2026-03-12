import { Page } from "playwright";
import { ExchangeRate, BankId, Currency } from "@repo/lib";
import { Agent } from "./base";

export class PopularAgent extends Agent {
  protected readonly bankId = BankId.POPULAR;
  protected readonly currencies = [Currency.USD, Currency.EUR];

  async scrapeUSD(page: Page): Promise<ExchangeRate | undefined> {
    await page.getByText("CALCULADORAS").click();
    await page.getByText("Divisas").click();
    await page.getByText(/\$ Dolar/).click();
    
    const buyInput = await page.waitForSelector("#compra_peso_dolar_modal");
    const buy = parseFloat(await buyInput.inputValue());
    
    const sellInput = await page.waitForSelector("#venta_peso_dolar_modal");
    const sell = parseFloat(await sellInput.inputValue());
    
    return { buy, sell };
  }

  async scrapeEUR(page: Page): Promise<ExchangeRate | undefined> {
    await page.getByText(/€ Euro/).click();

    const buyInput = await page.waitForSelector("#compra_peso_euro_modal");
    const buy = parseFloat(await buyInput.inputValue());
    
    const sellInput = await page.waitForSelector("#venta_peso_euro_modal");
    const sell = parseFloat(await sellInput.inputValue());
    
    return { buy, sell };
  }
}
