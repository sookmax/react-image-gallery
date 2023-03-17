export default function classNames(
  ...args: (string | string[] | undefined | false)[]
) {
  return args.filter(Boolean).flat().join(" ");
}
