export const add_path_s = (path: string): string => {
  if (path.split('/')[0] === 'http:') {
    return 'https://' + path.split('/')[2];
  }
  return path;
};
