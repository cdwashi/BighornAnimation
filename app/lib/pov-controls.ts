export function viewshedPresetEnabled(parameters: URLSearchParams): boolean {
  const mode = parameters.get('mode');
  return mode === 'belief' || mode === 'split' ||
    parameters.get('index') === 'cooke' ||
    parameters.get('scene') === 'reno-1620';
}
