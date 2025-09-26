import mongoose, { Schema, Document } from "mongoose";

export interface Permission {
  read: boolean;
  write: boolean;
}

export interface ITeam extends Document {
  teamId: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "deleted";
  notes?: string;
  permissions: {
    indent: {
      list: Permission;
      create: Permission;
      compare: Permission;
      approval: Permission;
    };
    purchaseOrders: {
      list: Permission;
      open: Permission;
    };
    items: {
      list: Permission;
      addItem: Permission;
    };
    vendors: {
      list: Permission;
      create: Permission;
      accounts: Permission;
    };
    teamAndProject: {
      teamList: Permission;
      addMember: Permission;
      projectList: Permission;
      addProject: Permission;
      boqList: Permission;
      addBoq: Permission;
    };
  };
}

const PermissionSchema = new Schema<Permission>(
  {
    read: { type: Boolean, default: false },
    write: { type: Boolean, default: false },
  },
  { _id: false }
);

const TeamSchema = new Schema<ITeam>(
  {
    teamId: { type: String, unique: true }, 
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive", "deleted"], default: "active" },
    notes: { type: String },

    permissions: {
      indent: {
        list: { type: PermissionSchema, default: {} },
        create: { type: PermissionSchema, default: {} },
        compare: { type: PermissionSchema, default: {} },
        approval: { type: PermissionSchema, default: {} },
      },
      purchaseOrders: {
        list: { type: PermissionSchema, default: {} },
        open: { type: PermissionSchema, default: {} },
      },
      items: {
        list: { type: PermissionSchema, default: {} },
        addItem: { type: PermissionSchema, default: {} },
      },
      vendors: {
        list: { type: PermissionSchema, default: {} },
        create: { type: PermissionSchema, default: {} },
        accounts: { type: PermissionSchema, default: {} },
      },
      teamAndProject: {
        teamList: { type: PermissionSchema, default: {} },
        addMember: { type: PermissionSchema, default: {} },
        projectList: { type: PermissionSchema, default: {} },
        addProject: { type: PermissionSchema, default: {} },
        boqList: { type: PermissionSchema, default: {} },
        addBoq: { type: PermissionSchema, default: {} },
      },
    },
  },
  { timestamps: true }
);

 
TeamSchema.pre<ITeam>("save", async function (next) {
  if (!this.teamId) {
    const lastTeam = await mongoose
      .model<ITeam>("Team")
      .findOne({})
      .sort({ createdAt: -1 })
      .exec();

    let newIdNumber = 1;

    if (lastTeam && lastTeam.teamId) {
      const lastId = lastTeam.teamId.split("-")[1];
      newIdNumber = parseInt(lastId, 10) + 1;
    }

    this.teamId = `TM-${newIdNumber.toString().padStart(3, "0")}`;
  }

  next();
});

const Team = mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
