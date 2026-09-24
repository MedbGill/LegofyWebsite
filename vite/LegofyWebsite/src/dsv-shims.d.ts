
declare module "*.csv" {
    export default <{ [key: string]: unknown }>Array;
}