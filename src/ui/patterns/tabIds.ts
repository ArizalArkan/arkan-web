/** Ids that link each tab to its panel (aria-controls / aria-labelledby). */
export const tabIds = (idBase: string, id: string) => ({
  tab: `${idBase}-tab-${id}`,
  panel: `${idBase}-panel-${id}`,
});
