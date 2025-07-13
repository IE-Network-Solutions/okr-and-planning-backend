export async function checkIfDataExists(
  values: Record<string, string>,
  anyRepository: any,
) {
  const messages: string[] = [];

  const checks = await Promise.all(
    Object.entries(values).map(async ([column, value]) => {
      const exists = await anyRepository.findOne({
        where: { [column]: value },
      });
      if (exists) {
        let fieldName = column;
        switch (column) {
          case 'name':
            fieldName = 'name';
            break;
          case 'email':
            fieldName = 'email address';
            break;
          case 'code':
            fieldName = 'code';
            break;
          case 'title':
            fieldName = 'title';
            break;
          default:
            fieldName = column.replace(/([A-Z])/g, ' $1').toLowerCase();
        }
        messages.push(
          `A ${fieldName} with the value "${value}" already exists. Please choose a different ${fieldName}.`,
        );
      }
      return exists;
    }),
  );

  const hasDuplicates = checks.some((exists) => exists);
  if (hasDuplicates) {
    throw new Error(messages.join(' '));
  }
}
