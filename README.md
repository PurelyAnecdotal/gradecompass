# GradeCompass

An advanced grade calculator designed to interface with StudentVUE®.

<sub>StudentVUE is a registered trademark of Edupoint Educational Systems LLC. GradeCompass is not affiliated with or endorsed by Edupoint Educational Systems LLC.</sub>

## Developing

Make sure to have [Bun](https://bun.sh) installed, then run `bun install` to install dependencies.

### Mocking

StudentVUE API requests are mocked in development mode, returning a cached copy of your student portal data that can be easily inspected and modified. You will need to create this data by retrieving it from your student portal using the script or you will get import errors at runtime. You should re-run this command whenever you would like to update it to reflect StudentVUE's current data.

```bash
bun run generate-mocks
```

The script will prompt you for your login information. If you do not want to have to enter it every time, you can set the [environment variables used](./generate_mock_data.ts#L101) in a `.env` file.

You must also set the environment variable `PUBLIC_MOCK_STUDENTVUE_ORIGIN` to your StudentVUE domain origin (e.g. `https://[your-district]-psv.edupoint.com`) when mocking is enabled. This can be done in a `.env` file.

Alternatively, you can disable mocking by setting the environment variable `PUBLIC_DISABLE_MSW` to `true`, such as in a `.env` file or like so:

```bash
PUBLIC_DISABLE_MSW=true bun run dev
```

You may need to unregister the service worker.

To disable mocking in on a specific browser page, you can open the developer console and run `msw.stop()`, and all future requests on that page will go to the real API.

### Dev Server

```bash
bun run dev
```

### Building

```bash
bun run build
```

You can preview the production build with `bun run preview`.

## Hosting

When hosting your own version of GradeCompass, please [change](src/lib/brand.ts) the name, contact email, and repository link to avoid confusion with our version.

Vercel and Netlify are both good options for hosting SvelteKit apps like GradeCompass.

## License

GradeCompass is licensed under the [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/), an open-source copyleft license. What this means for you is that if you

- modify the source code of GradeCompass, and
- host this modified version on the internet,

you are required to publish the source code of your modified version under the same GNU AGPL license and document the changes you have made.

## Example .env file

Only `PUBLIC_MOCK_STUDENTVUE_ORIGIN` is required.

```dotenv
# dev server
PUBLIC_DISABLE_MSW=false
PUBLIC_MOCK_STUDENTVUE_ORIGIN=

# generating mocks
STUDENTVUE_DOMAIN=
STUDENTVUE_USERNAME=
STUDENTVUE_PASSWORD=
STUDENTVUE_MOCK_DOCUMENT_GU=
STUDENTVUE_MOCK_ATTACHMENT_GU=
```
