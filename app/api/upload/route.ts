// import { auth } from "@/lib/auth";
// import { RejectUpload, route, type Router } from "@better-upload/server";
// import { toRouteHandler } from "@better-upload/server/adapters/next";
// import { aws } from "@better-upload/server/clients";
//
// const router: Router = {
//   client: aws({
//     accessKeyId: process.env.S3_ACCESS_KEY || "",
//     secretAccessKey: process.env.S3_SECRET_KEY || "",
//     region: "eu-west-3",
//   }),
//   bucketName: "digital-closet-assets",
//   routes: {
//     images: route({
//       fileTypes: ["image/*"],
//       multipleFiles: true,
//       maxFiles: 2,
//       maxFileSize: 1024 * 1024 * 5,
//       onBeforeUpload: async ({ req, files, clientMetadata }) => {
//         const session = await auth.api.getSession({
//           headers: req.headers,
//         });
//
//         if (!session?.user) {
//           throw new RejectUpload("Authentication required");
//         }
//
//         return {
//           generateObjectInfo: ({ file }) => ({ key: `files/${file.name}` }),
//         };
//       },
//     }),
//   },
// };
//
// export const { POST } = toRouteHandler(router);
//

import { auth } from "@/lib/auth";
import { RejectUpload, route, type Router } from "@better-upload/server";
import { toRouteHandler } from "@better-upload/server/adapters/next";
import { aws } from "@better-upload/server/clients";

export const s3 = aws({
  accessKeyId: process.env.S3_ACCESS_KEY || "",
  secretAccessKey: process.env.S3_SECRET_KEY || "",
  region: "eu-west-3",
});

const router: Router = {
  client: s3,
  bucketName: process.env.S3_BUCKET_NAME || "",
  routes: {
    form: route({
      multipleFiles: true,
      maxFiles: 2,
      maxFileSize: 1024 * 1024 * 5, // 5MB
      onBeforeUpload: async ({ req, files, clientMetadata }) => {
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
