import { auth } from "@/lib/auth";
import { RejectUpload, route, type Router } from "@better-upload/server";
import { toRouteHandler } from "@better-upload/server/adapters/next";
import { aws } from "@better-upload/server/clients";

export const s3 = aws({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY || "",
  secretAccessKey: process.env.AWS_S3_SECRET_KEY || "",
  region: "eu-west-3",
});

const router: Router = {
  client: s3,
  bucketName: process.env.AWS_S3_BUCKET_NAME || "",
  routes: {
    form: route({
      multipleFiles: true,
      maxFiles: 2,
      maxFileSize: 1024 * 1024 * 5, // 5MB
      onBeforeUpload: async ({ req }) => {
        const session = await auth.api.getSession({
          headers: req.headers,
        });

        if (!session?.user) {
          throw new RejectUpload("Authentication required");
        }

        const uuid = crypto.randomUUID();
        return {
          generateObjectInfo: ({ file }) => ({
            key: `form/${uuid}-${file.name}`,
          }),
        };
      },
    }),
  },
};

export const { POST } = toRouteHandler(router);
